%let directory="Y:\Reports\PC\FacultyStaff\Data";

Data _null_;
	fileList = &directory || "\_fileList.csv";
	call symput("fileList", fileList);
Run;

Proc Import file="&fileList"
    out=fileList
    dbms=csv
	replace;
Run;
	

* Get the default file. ;
Proc SQL;
	create table default as
	select *
	from fileList
	where default="Y";
Quit;
Data default (drop=path lastSlash newPath filename default_page);
	set default;
	path = &directory; * Cannot end with slash. ;
	lastSlash = lastOccurOfChar(web_path, '/');
	length newPath $1024;
	newPath = trim(path) || "\" || substr(web_path, lastSlash+1);
	if _n_ = 1 then do;
		call symput('newPath', newPath);
	end;
Run;

Data default (keep=date_str);
	set default;
	date = mdy(month, day, year);
	date_str = put(date,mmddyy10.); 
Run;
*%deleteColumns(default, asOfDate_str);
%renameVariables(default, date_str|asOfDate_str);

filename largeF "&newPath" lrecl=1000000;
Proc Import datafile=largeF out=temp1 dbms=csv replace;
	guessingrows = MAX;
Run;
Data temp1;
	set temp1;
	length column_name $20;
	column_name = "current";
Run;

* Get last years file. ;
Proc SQL;
	create table last_year as
	select *
	from fileList A,
		(
			select *
			from fileList
			where default="Y"
		) B
	where A.month = B.month
	and A.day = B.day
	and A.year = (B.year - 1);
Quit;

Data last_year (drop=path lastSlash newPath filename default_page);
	set last_year;
	path = &directory; * Cannot end with slash. ;
	lastSlash = lastOccurOfChar(web_path, '/');
	length newPath $1024;
	newPath = trim(path) || "\" || substr(web_path, lastSlash+1);
	if _n_ = 1 then do;
		call symput('newPath', newPath);
	end;
Run;
filename largeF "&newPath" lrecl=1000000;
Proc Import datafile=largeF out=temp2 dbms=csv replace;
	guessingrows = MAX;
Run;
Data temp2;
	set temp2;
	length column_name $20;
	column_name = "last_year";
Run;

* Combine data. ;
Data temp0;
	set temp1 temp2;
	minority = 'N';
	if computed_race = "Black, Non-Hispanic Only" then minority = 'Y';
	else if computed_race = "Hispanic or Latino, regardless of race" then minority = 'Y';
	else if computed_race = "American Indian or Alaskan Native, Non-Hispanic Only" then minority = 'Y';
	else if computed_race = "Native Hawaiian or Other Pacific Islander, Non-Hispanic Only" then minority = 'Y';
	else if computed_race = "Two or More Races" then minority = 'Y';
Run;
%merge(temp0, default);

Proc Sort data=temp0;
	by asOfDate_str Job_type Job_ecls_group job_ecls_ft_pt peafact_rank_desc tenure_desc gender computed_race minority column_name;
Run;

Proc Transpose data=temp0 out=temp;
	by asOfDate_str Job_type Job_ecls_group job_ecls_ft_pt peafact_rank_desc tenure_desc gender computed_race minority;
	var total;
	id column_name;
Run;


* Create a blank metric table to hold the metrics for this.;
Data metrics;
	set ds_rep.pc_datacards;
	if _N_ > 1 then delete;
	elementType = "X";
Run;
%resizeString(metrics, newSize=200, List=division metric link description term timeFactor change change_perc);

* Metric 7 ;
Proc Summary data=temp nway;
	where minority = "Y" and JOB_ECLS_GROUP in ("Fulltime Faculty" "Chairs") and TENURE_DESC in ("Tenured" "On Tenure Track");
	class asOfDate_str;
	var current last_year;
	output out=summary sum=;
Run;
Data metric1 (drop=change_num term_desc asOfDate_str current last_week last_year _TYPE_ _FREQ_ change_perc_num);
	set summary;
	elementType = "DataCard";
	division = "Diversity";
	metric = "URM FT Faculty Tenured/Tenure Track";
	order = 7;
	timeFactor = "Yearly";
	*term = term_desc;
	date = asOfDate_str;
	value = current;
	length change $30;
	change_num = current - last_year;
	change = trim(left(put(change_num,20.)));
	change_perc_num = change/last_year;
	change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "Under-Represented Minority FT Faculty Tenured/Tenure Track compared to this date last year.";
Run;
Data metrics; set metrics metric1; Run;

* Metric 8 ;
Proc Summary data=temp nway;
	where minority = "Y" and JOB_ECLS_GROUP in ("Fulltime Professionals" "Fulltime Hourly Staff");
	class asOfDate_str;
	var current last_year;
	output out=summary sum=;
Run;
Data metric1 (drop=change_num term_desc asOfDate_str current last_week last_year _TYPE_ _FREQ_ change_perc_num);
	set summary;
	elementType = "DataCard";
	division = "Diversity";
	metric = "URM FT Staff";
	order = 8;
	timeFactor = "Yearly";
	*term = term_desc;
	date = asOfDate_str;
	value = current;
	length change $30;
	change_num = current - last_year;
	change = trim(left(put(change_num,20.)));
	change_perc_num = change/last_year;
	change_perc = trim(left(put(change_perc_num*100, 20.2))) || '%';
	link = "https://www.irserver2.eku.edu/reports/pc/facultystaff/";
	description = "Under-Represented Minority Staff compared to this date last year.";
Run;
Data metrics; set metrics metric1; Run;



*************************************************************************;
Data ds_rep.pc_dataCards;
	set ds_rep.pc_dataCards;
	if elementType = "DataCard" and division = "Diversity" 
		and metric in ("URM FT Faculty Tenured/Tenure Track" "URM FT Staff") then delete;
Run;

Data ds_rep.pc_dataCards;
	set ds_rep.pc_dataCards metrics;
	if elementType="X" then delete;
Run;

/*
*************************************************************************
* Create csv from ds_rep.pc_datacards. ;
Proc Export data=ds_rep.pc_datacards outfile="Y:\PC\dataCards.csv" replace;
Run;
*/
