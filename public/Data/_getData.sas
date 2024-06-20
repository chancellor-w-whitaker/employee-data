* Set this up on a weekly schedule. 
*	1=Sunday .... 4=Wednesday, 5=Thursday, 6=Friday .... 7=Saturday ;
*%stopExe(unlessTheseWeekDays=5);

* This was moved to the main macro in the file. ;
*%stopExe(unlessTheseDays=1 7 14 21 28); * Only run on these days in the month. ;

* Only on these days will stack the files so we should only have 1 execution when this runs.;
* Always make sure 1 is in the list. Nov. 1 is IPEDS date and is typically what we use to report.;

%let dataDirectory=Y:\Reports\PC\FacultyStaff\Data;  * No trailing slash ;

%macro produceDatafile(inDate=); * inDate=23OCT2020 ;
	%getJobs(captureDate=&inDate, distinctEmployees='Y', pict_Codes='SM,BW,FA,ST,SS');

	* Get TeleWork info. ;
	Data _null_;
		date="'" || strip("&inDate") || "'d";
		call symput("Conv_Date", date);
	Run;
	Data _null_;
		date = &Conv_Date;
		date_str = "'" || strip(put(date, mmddyy10.)) || "'";
		call symput('Conv_Date', date_str);
	Run;
	%*getTeleWork(date="11/2/2023");
	%getTeleWork(date=&Conv_Date);
	Proc SQL;
		create table telework2 as
		select distinct pidm, "Y" as telework
		from telework;
	Quit;
	%merge(jobs, telework2, pidm, deleteTables=telework telework2);

	* See if telework exists in jobs. ;
	%local telework_exists;
	Data _null_;
		dsid = open(jobs);
		varnum = varnum(dsid,'telework');
		rc = close(dsid);
		call symput("telework_exists", varnum);
	Run;
	%*put &telework_exists;


	Data primary;
		set jobs;
		
		%if &telework_exists=0 %then %do;
			telework = "N";
		%end;
		%else %if "&telework_exists"="." %then %do;
			telework = "N";
		%end;
		%else %do;
			if missing(telework) then telework = "N";
		%end;

		* Assign Staff/Faculty/Student ;
		length JOB_TYPE $10;
		if JOB_ECLS_GROUP = "Chairs" then JOB_TYPE = "Faculty";
		else if JOB_ECLS_GROUP = "Fulltime Faculty" then JOB_TYPE = "Faculty";
		else if JOB_ECLS_GROUP = "PT Faculty" then JOB_TYPE = "Faculty";
		else if JOB_ECLS_GROUP = "Fulltime Hourly Staff" then JOB_TYPE = "Staff";
		else if JOB_ECLS_GROUP = "Fulltime Professionals" then JOB_TYPE = "Staff";
		else if JOB_ECLS_GROUP = "PT Hourly Staff" then JOB_TYPE = "Staff";
		else if JOB_ECLS_GROUP = "PT Professionals" then JOB_TYPE = "Staff";
		else if JOB_ECLS_GROUP = "GA" then JOB_TYPE = "Student";
		else if JOB_ECLS_GROUP = "Student" then JOB_TYPE = "Student";
		else if JOB_ECLS_GROUP = "Administrators/Deans" then do;
			if find(upcase(JOB_TITLE), "DEAN") > 0 AND find(upcase(JOB_TITLE), "STUDENTS") > 0  then JOB_TYPE = "Staff";
			else if find(upcase(JOB_TITLE), "DEAN") > 0 AND find(upcase(JOB_TITLE), "LIBRAR") > 0  then JOB_TYPE = "Staff";
			else if find(upcase(TIME_SHEET_ORGN_DESC), "DEAN") > 0 OR find(upcase(JOB_TITLE), "DEAN") > 0 then JOB_TYPE = "Faculty";
			else JOB_TYPE = "Staff";
		end;

		if missing(TENURE_DESC) then TENURE_DESC = "None";

		* Default to Female if something else is presented. This was causing duplicates because an N was present. ;
		if Gender ^= "F" and Gender ^= "M" then Gender = "F"; 
			
		person_uid = pidm;
	Run;

	%addRaceV03(primary, keepAllColumns=N,  
		usePriorOfficialRace=N,	useTermCode=N, officialCutOffYrs=.,
		useEnrollmentReptRace=N, captureDateIsDateTime=N,
		useBannerFuncRace=Y,
		newRaceCol=computed_race
		);

	Proc Summary data=primary nway missing;
		class START_DATE JOB_TYPE JOB_ECLS_GROUP JOB_ECLS_FT_PT PEAFACT_RANK_DESC TENURE_DESC GENDER computed_race telework;
		output out=summary (drop=_TYPE_ rename=(_FREQ_=total));
	Run;
	%resizeString(summary, newSize=100, List=JOB_ECLS_FT_PT GENDER computed_race telework);

	%let outputFile=;
	Data summary2 (drop=folder fileName START_DATE);
		set summary;
		JOB_ECLS_FT_PT = ftptDesc(JOB_ECLS_FT_PT);
		GENDER = sexDesc(GENDER);
		computed_race = raceDesc(computed_race);
		if Missing(PEAFACT_RANK_DESC) then PEAFACT_RANK_DESC = "None";
		if Missing(Job_type) then Job_type = "Unknown";
		if telework="Y" then telework="Yes";
		else telework="No";

		if _N_ = 1 then do;
			*folder = "Y:\Reports\PC\FacultyStaff\Data"; 
			folder = "&dataDirectory";
			fileName = trim(folder) || "\DATA-" || put(datepart(START_DATE),yymmdd10.) || ".csv";
			call symput("outputFile", fileName);
		end;
	Run;

	Proc Export data=summary2 outfile="&outputFile" replace;
	Run;

	%deleteTables(jobs primary summary summary2);
%mend;
*%produceDatafile(inDate=02NOV2023);

%macro getDatesToProcess(numberToReturn=5, ignoreExistingFiles=Y);
	*************************************************************
	** This data step is to get two macro variables for dates.
	** -- today: macro variable. 
	** -- last_year: macro variable.
	** -- These will be passed to the job function. ;
	Data dates (drop=last_year i processNumber);
		format today date9. last_year date9.;
		today = today();
		*today = '28JAN2021'd;
		output;
		processNumber = &numberToReturn-1;
		do i = 1 to processNumber;
			last_year = mdy(month(today), day(today), year(today)-1);
			if missing(last_year) then do;
				* This should only happen when today is a leap year and date is Feb 29th. ;
				last_year = mdy(month(today), day(today)-1, year(today)-1);
			end;
			today = last_year;
			output;
		end;
	Run;

	* Exit the macro if there are no dates to process. ;
	%let dateCount=%numberOfRecords(inds=dates);
	%if &dateCount <= 0 %then %return;

	Data dates;
		set dates;
		string_date = put(today, date9.);
	Run;

	%getFolderFileList("&dataDirectory", 
		outds=folderFileList,
		includeSubdirectories=N,
		showDirectoriesOnly=N,
		showFilesOnly=N);

	Data folderFileList (keep=today process);
		set folderFileList;
		if scan(filename, 1, '-') = 'DATA' then do;
			year = input(scan(filename, 2, '-'),best10.);
			month = input(scan(filename, 3, '-'),best10.);
			day = input(substr(scan(filename, 4, '-'), 1, find(scan(filename, 4, '-'), '.')-1),best10.);
			format today date9.;
			today = mdy(month, day, year);
			process = "N";
			output;
		end;
	Run;
	%merge(dates, folderFileList, today, deleteTables=);

	%if &ignoreExistingFiles=Y %then %do;
		Data dates;
			set dates;
			where process ^= "N";
		Run;
	%end;
%mend;


%macro main();
	* 8/24/2023 : This seems to always be breaking so I am moving the condition of run day to here so grabbing 
	*	the latest file and creating the metric will always run. ;
	Data stopExe (drop=daysString todayString count today);
		daysString = "1 7 14 21 28";
		today = DAY(today());
		todayString = trim(left(put(today, 2.)));

		count = 1;
		do while (scan(daysString, count) ^= "");
			compDay = scan(daysString, count);
			output;
			count + 1;
		end;
	Run;
	%local proceed;
	%let proceed=N;
	Proc SQL noprint;
		select distinct "Y" into :Proceed 
		from stopExe
		where trim(left(put(DAY(today()), 2.))) in (select compDay from stopExe);
	Quit;
	%put Proceed=&proceed;
	
	* If proceed is N, it will not create a new file but the metrics will still get processed.;
	%if "&proceed"="Y" %then %do;
		%getDatesToProcess(numberToReturn=7,ignoreExistingFiles=N);

		* Exit the macro if there are no dates to process. ;
		%let dateCount=%numberOfRecords(inds=dates);
		%if &dateCount <= 0 %then %return;

		Proc SQL noprint;
			select distinct string_date into :dates separated by ' ' from dates;
		Quit;
		%local count;
		%let count=0;
		%do %while(%qscan(&dates,&count+1,%str( )) ne %str());
			%let count = %eval(&count+1);
			%let var =  %qscan(&dates,&count,%str( ));
			%put &count - &var;
			%produceDatafile(inDate=&var);
		%end;
	%end;
%mend;
%main();

%getFolderFileList("&dataDirectory", 
	outds=folderFileList2,
	includeSubdirectories=N,
	showDirectoriesOnly=N,
	showFilesOnly=N);

Data folderFileList2;
	set folderFileList2;
	if scan(filename, 1, '-') = 'DATA' then do;
		filename_path = trim("&dataDirectory") || "\" || trim(filename_path);
		year = input(scan(filename, 2, '-'),best10.);
		month = input(scan(filename, 3, '-'),best10.);
		day = input(substr(scan(filename, 4, '-'), 1, find(scan(filename, 4, '-'), '.')-1),best10.);
		format today date9.;
		today = mdy(month, day, year);
		dayOfYear = put(month, z2.) || put(day, z2.);
		output;
	end;
Run;
Proc Sort data=folderFileList2; by descending today; Run;
Data exportFileList (drop=filename_path path filename record directoryOrFile dayOfYear today);
	set folderFileList2;
	if _N_ = 1 then default = "Y"; *descending by date, the first one will always be the default.;
	web_path = "Data/" || trim(Path);
Run;
Proc Export data=exportFileList outfile="&dataDirectory.\_fileList.csv" replace;
Run;


*****************************************************************************************************
* Run to here for a particular date. 
*****************************************************************************************************;

Proc SQL;
	create table fileList as
	select *
	from folderFileList2
	where dayOfYear = (
		select distinct dayOfYear
		from folderFileList2
		having max(today) = today
	)
	order by today desc;
Quit;

Data _null_;
	set fileList;
	if _N_ = 1 then do; 
		call symput("mainFile", trim(filename_path));
		call symput("mainFileName", trim(filename));
	end;
	else if _N_ = 2 then do;
		call symput("priorFile", trim(filename_path));
		call symput("priorFileName", trim(filename));
	end;
Run;
%put &mainFile -- &mainFileName;
%put &priorFile -- &priorFileName;

Proc Import datafile="&mainFile" out=mainDataset replace;
	GUESSINGROWS=MAX;
Run;
%getVariables(mainDataset, outds=variables, incType=N, incLength=N, incVarNum=Y);
Proc SQL noprint;
	create table variables_ as
	select *
	from variables
	where upcase(NAME) not in ('TOTAL')
	order by VARNUM;

	*drop table variables;
Quit;

Proc SQL noprint;
	select NAME into :vars separated by ' '
	from variables_
	order by VARNUM;

	*drop table variables;
Quit;


Data mainDataset (drop=total);
	set mainDataset;
	*infileName = "&mainFileName";
	main_total = total;
Run;

Proc Import datafile="&priorFile" out=priorDataset replace;
	GUESSINGROWS=MAX;
Run;

Data priorDataset (drop=total);
	set priorDataset;
	*infileName = "&mainFileName";
	prior_total = total;
Run;

%merge(mainDataset, priorDataset, &vars, mergeType=F);
%fillMissingValues(mainDataset, 0, varList=main_total prior_total);

Data mainDataset (drop=year month day);
	retain mainFileName;
	set mainDataset;
	mainFileName = "&mainFileName";
	change_total = main_total - prior_total;

	year = input(scan(mainFileName, 2, '-'), best10.);
	month = input(scan(mainFileName, 3, '-'), best10.);
	day = input(scan(scan(mainFileName, 4, '-'), 1, '.'), best10.);

	

	format current_date mmddyy10.;
	current_date = mdy(month, day, year);
	*through_date = input(substr(throughDate, 1, 10), mmddyy10.);
Run;

Proc Summary data=mainDataset nway;
	*where JOB_TYPE not in ("Student" "Unknown");
	class current_date JOB_TYPE JOB_ECLS_FT_PT;
	var main_total prior_total change_total;
	output out=summary (drop=_TYPE_ _FREQ_) sum=;
Run;

Proc Summary data=mainDataset nway;
	*where JOB_TYPE not in ("Student" "Unknown");
	where telework = "Yes";
	class current_date JOB_TYPE JOB_ECLS_FT_PT telework;
	var main_total prior_total change_total;
	output out=telework (drop=_TYPE_ _FREQ_) sum=;
Run;

/*
Proc SQL;
	create table test as
	select * 
	from mainDataset
	where JOB_TYPE="Staff" 
	and JOB_ECLS_FT_PT = "Part-time"
	and Gender =  "Female"
	and computed_race = 'White, Non-Hispanic Only'
	and PEAFACT_RANK_DESC = "None"
	and TENURE_DESC = "None"
	and JOB_ECLS_GROUP = "PT Hourly Staff";
Quit;
Proc Sort data=test; by &vars; Run;
*/


* Create a blank metric table to hold the metrics for this.;
%pcDataCardBlank(outds=metrics);


* Metric;
* -- Yearly Comparison ;
Data metric1 (keep=elementType division metric order timeFactor term date value change link description change_perc);
	set summary;
	where JOB_TYPE = "Faculty" and JOB_ECLS_FT_PT = "Full-time";
	elementType = "DataCard";
	division = "Finance";
	metric = "Full-time Faculty";
	order = 1;
	timeFactor = "Yearly";
	*term = fiscal_year;
	date = put(current_date, mmddyy10.);
	value = main_total;
	length change $30;
	change_num = change_total;
	change = trim(left(put(change_num,20.)));
	change_perc_num = change_num / prior_total;
	change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "The number of full-time faculty compared to this date last year.";
Run;
Data metrics; set metrics metric1; Run;

* Metric;
* -- Yearly Comparison ;
Data metric1 (keep=elementType division metric order timeFactor term date value change link description change_perc);
	set summary;
	where JOB_TYPE = "Faculty" and JOB_ECLS_FT_PT = "Part-time";
	elementType = "DataCard";
	division = "Finance";
	metric = "Part-time Faculty";
	order = 2;
	timeFactor = "Yearly";
	*term = fiscal_year;
	date = put(current_date, mmddyy10.);
	value = main_total;
	length change $30;
	change_num = change_total;
	change = trim(left(put(change_num,20.)));
	change_perc_num = change_num / prior_total;
	change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "The number of part-time faculty compared to this date last year.";
Run;
Data metrics; set metrics metric1; Run;

* Metric;
* -- Yearly Comparison ;
Data metric1 (keep=elementType division metric order timeFactor term date value change link description change_perc);
	set summary;
	where JOB_TYPE = "Staff" and JOB_ECLS_FT_PT = "Full-time";
	elementType = "DataCard";
	division = "Finance";
	metric = "Full-time Staff";
	order = 3;
	timeFactor = "Yearly";
	*term = fiscal_year;
	date = put(current_date, mmddyy10.);
	value = main_total;
	length change $30;
	change_num = change_total;
	change = trim(left(put(change_num,20.)));
	change_perc_num = change_num / prior_total;
	change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "The number of full-time staff compared to this date last year.";
Run;
Data metrics; set metrics metric1; Run;

* Metric;
* -- Yearly Comparison ;
Data metric1 (keep=elementType division metric order timeFactor term date value change link description change_perc);
	set summary;
	where JOB_TYPE = "Staff" and JOB_ECLS_FT_PT = "Part-time";
	elementType = "DataCard";
	division = "Finance";
	metric = "Part-time Staff";
	order = 4;
	timeFactor = "Yearly";
	*term = fiscal_year;
	date = put(current_date, mmddyy10.);
	value = main_total;
	length change $30;
	change_num = change_total;
	change = trim(left(put(change_num,20.)));
	change_perc_num = change_num / prior_total;
	change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "The number of part-time staff compared to this date last year.";
Run;
Data metrics; set metrics metric1; Run;


* Metric;
* -- Yearly Comparison ;
Data metric1 (keep=elementType division metric order timeFactor term date value change link description change_perc);
	set telework;
	where JOB_TYPE = "Staff" and JOB_ECLS_FT_PT = "Full-time";
	elementType = "DataCard";
	division = "Finance";
	metric = "Full-time Staff Telework";
	order = 5;
	*timeFactor = "Yearly";
	*term = fiscal_year;
	date = put(current_date, mmddyy10.);
	value = main_total;
	length change $30;
	*change_num = change_total;
	*change = trim(left(put(change_num,20.)));
	*change_perc_num = change_num / prior_total;
	*change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "The number of full-time staff teleworking.";
Run;
Data metrics; set metrics metric1; Run;



/*
Data metrics;
	set metrics;
	if elementType="X" then delete;
Run;

* Remove all the faculty/staff datacards. ;
%macro add_metric();
	* If there are no records, do not mess with what was there. ;
	%let count=%numberOfRecords(inds=metrics);
	%if &count <= 0 %then %do;
		%return;
	%end;

	Data cards;
		set ds_rep.pc_dataCards;
		if elementType = "DataCard" and division = "Finance" 
			and metric in ("Full-time Faculty" "Part-time Faculty" "Full-time Staff" "Part-time Staff") then delete;
	Run;

	Data ds_rep.pc_dataCards;
		set cards metrics;
		if elementType="X" then delete;
	Run;
%mend;
%add_metric();
*/
%pcDataCardDelete(division='Finance', metric='Full-time Fac*');
%pcDataCardDelete(division='Finance', metric='Part-time Fac*');
%pcDataCardDelete(division='Finance', metric='Full-time Sta*');
%pcDataCardDelete(division='Finance', metric='*Part-time Sta*');
%pcDataCardInsert(inds=metrics);

/*
*************************************************************************
* Create csv from ds_rep.pc_datacards. ;
Proc Export data=ds_rep.pc_datacards outfile="Y:\PC\dataCards.csv" replace;
Run;
*/
