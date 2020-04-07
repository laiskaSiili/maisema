'use strict';
console.log('table.js');

/**
 * Configuration options:
 * targetId: 'table'
 * initComplete: function() {}
 * columns: {}
 */
class DataTableWrapper {
    constructor(conf) {
        this.conf = conf;
        this.tableEl = $('#' + (conf['tableId'] || 'table'));
        this.table = this.tableEl.DataTable({
            destroy: true,
            data: {},
            initComplete: conf['initComplete'] || function() {},
            columns: conf['columns'] || {}
        })

    }

    onRowClick(callback) {
        this.tableEl.on('click', 'tbody tr',  callback);
    }

    onRowDblClick(callback) {
        this.tableEl.on('dblclick', 'tbody tr', callback);
    }

    onSearchInputChange(callback) {
        this.table.on('search.dt', callback);
    }

    getRowsElementsWithSearchApplied() {
        return this.table.rows({search:'applied'}).nodes();
    }

}