export default class TableComponent {
  constructor() {
    //add data-header to td's in custom table.
    Array.from(document.querySelectorAll('.custom-table table')).forEach((table: HTMLTableElement) => {
      this.initCustomTable(table);
    });
  }

  private initCustomTable(table: HTMLTableElement) {
    Array.from(table.querySelectorAll('td')).forEach((td: HTMLTableDataCellElement) => {
      const newDiv = document.createElement('div');
      newDiv.innerHTML = td.innerHTML;
      td.innerHTML = newDiv.outerHTML;
    });

    const tableHead = table.querySelector('thead');
    if (tableHead) {
      const headings = Array.from(tableHead.querySelectorAll('th'))
        .reverse()
        .map((th) => th.innerText);
      Array.from(table.querySelectorAll('tbody tr')).forEach((tr) => {
        Array.from(tr.querySelectorAll('td'))
          .reverse()
          .forEach((td, index) => {
            td.setAttribute('data-label', headings[index]);
          });
      });
    }
  }
}
