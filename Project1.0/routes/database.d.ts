export declare module Project {
    class api {
        host: string;
        dbName: string;
        constructor(dbName?: string);
        createDdoc(dbName?: string): void;
        indexView(view: string, dbName?: string): any;
        selectObj(view: string, field: string, dbName?: string): void;
        getData(item: string, dbName?: string): any;
        getMultipleData(arrKey: any, view: string, dbName?: string): any;
        findData(key: any, view: string, dbName?: string): any;
        insertData(data: any, dbName?: string): any;
        updateData(data: any, dbName?: string): any;
        deleteData(_id: string, _rev: string, dbName?: string): any;
        searchView(view: string, dbName?: string): any;
        syncDB(dbName?: string): void;
    }
}
