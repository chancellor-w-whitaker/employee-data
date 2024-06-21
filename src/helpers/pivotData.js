export const pivotData = ({
  pivotOn = "",
  groupBy = [],
  sumUp = [],
  data = [],
}) => {
  if (groupBy.length === 0) {
    const summaryRow = {};

    data?.forEach((row) => {
      const pivotValue = row[pivotOn];

      if (!(pivotValue in summaryRow)) {
        summaryRow[pivotValue] = {
          [pivotOn]: pivotValue,
          ...Object.fromEntries(sumUp.map((measure) => [measure, 0])),
        };
      }

      sumUp.forEach(
        (measure) => (summaryRow[pivotValue][measure] += row[measure])
      );
    });

    return { topRowData: [summaryRow], rowData: [{}] };
  }

  // ! reference to each pivot row will be stored in here
  const magicArray = [];

  // ! all numerical values summarized in here
  const summaryRow = {};

  // ! traverse tree of unique field:value pairs to pivot data
  const tree = {};

  // ! only need to iterate data once
  data?.forEach((row) => {
    // ! make root mutable like an iterable in a for loop
    let currentRoot = tree;

    // ! the pivot value of current row
    const pivotValue = row[pivotOn];

    // ! will hold each group by field with its value,
    // ! such that it can be placed in an object
    const entries = [];

    // ! for each group by field,
    groupBy.forEach((column, index) => {
      // ! convenient variable because will do something different when index is last index
      const isLastIndex = index === groupBy.length - 1;

      // ! value of current group by field
      const columnValue = row[column];

      // ! store field:value pair
      entries.push([column, columnValue]);

      // ! if value is not yet in tree,
      if (!(columnValue in currentRoot)) {
        // ! if last group by field,
        if (isLastIndex) {
          // ? where grid rows gets initialized

          // ! have reached row to be inserted into grid,
          // ! so create object from field:value entries
          currentRoot[columnValue] = Object.fromEntries(entries);

          // ! push reference to grid row into grid array so its placement is stored,
          // ! and you can just manipulate object's contents during tree traversal
          magicArray.push(currentRoot[columnValue]);
        } else {
          // ! when value is not in tree but not iterating on last group by field,
          // ! initialize segment in tree
          currentRoot[columnValue] = {};
        }
      }

      // ! iterate to next segment in tree, similar to i++ in a for loop
      currentRoot = currentRoot[columnValue];

      // ! after ensuring creation of tree segment & iterating to new tree segment,
      // ! handle some more logic if current group by field is last group by field
      if (isLastIndex) {
        // ? where deeply nested measure totals objects get initialized

        // ? should you also dump the pivot field:value
        // ? & every group by field:value into the initialized object?
        const unPivotedFields = [[pivotOn, pivotValue], ...entries];

        // ? would give you easy access to the summarized data "un-pivoted"

        // * if you don't need to read Object.keys(thisObject),
        // * and you only declaratively read key values in thisObject,
        // * then it shouldn't matter if thisObject has extra keys

        // ! if pivot value is not initialized in grid row, initialize
        // ! pivot value points to grid row's summarized measure values
        if (!(pivotValue in currentRoot)) {
          // ! initialize object from un-pivoted fields
          currentRoot[pivotValue] = Object.fromEntries(unPivotedFields);
        }

        // ! also record pivot value in summary row of entire pivoted data
        if (!(pivotValue in summaryRow)) {
          // ! initialize object from un-pivoted fields
          // summaryRow[pivotValue] = Object.fromEntries(unPivotedFields);
          summaryRow[pivotValue] = { [pivotOn]: pivotValue };
        }

        // ! during tree traversal,
        // ! each grid row needs an object for every pivot value traversed above
        // ! each pivot value in each grid row needs totals for every measure
        // ! this variable is created for convenience purposes
        const deeplyNestedMeasureTotalsObject = currentRoot[pivotValue];

        // ! measure totals of current pivot value in summary row
        const oneMeasureTotalsObjectOfSummaryRow = summaryRow[pivotValue];

        // ! for every measure field,
        sumUp.forEach((measure) => {
          // ! measure's value in data row
          const numericValue = row[measure];

          // ! if measure field is not yet initialized,
          if (!(measure in deeplyNestedMeasureTotalsObject)) {
            // ! initialize to 0 (is a running total)
            deeplyNestedMeasureTotalsObject[measure] = 0;
          }

          // ! measure field also needs to be initialized for every pivot value in summary row
          if (!(measure in oneMeasureTotalsObjectOfSummaryRow)) {
            oneMeasureTotalsObjectOfSummaryRow[measure] = 0;
          }

          // ! only want actual numbers to contribute to running total
          if (typeof numericValue === "number") {
            // ! add measure value of data row to this running total
            deeplyNestedMeasureTotalsObject[measure] += numericValue;

            // ! account for this measure value in final summary row as well
            oneMeasureTotalsObjectOfSummaryRow[measure] += numericValue;
          }
        });
      }
    });
  });

  // ! rowData is pseudonym for rows displayed in grid,
  // ! so rowData's value should be pivoted data array
  const rowData = magicArray;

  // ! topRowData is pseudonym for rows pinned to top of grid,
  // ! so topRowData's value should be array of single element being the summary row
  const topRowData = [summaryRow];

  return { topRowData, rowData };
};
