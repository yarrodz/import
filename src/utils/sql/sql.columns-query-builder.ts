// interface IColumnFormat {
//   columnPropertyName: string;
//   columnPropertyType: string;
// }

// export const columnsFormat: Record<string, IColumnFormat> = {
//   MySQL: {
//     columnPropertyName: 'COLUMN_NAME',
//     columnPropertyType: 'DATA_TYPE'
//   },
//   PostgreSQL: {
//     columnPropertyName: 'column_name',
//     columnPropertyType: 'data_type'
//   },
//   'Microsoft SQL Server': {
//     columnPropertyName: 'COLUMN_NAME',
//     columnPropertyType: 'DATA_TYPE'
//   }
// };

// export function createSelectColumnsQuery(dialect: string, table: string) {
//   let columnsQuery = '';
//   switch (dialect) {
//     case 'MySQL':
//       columnsQuery = mysqlColumnsQuery(table);
//       break;
//     case 'Microsoft SQL Server':
//       columnsQuery = mssqlColumnsQuery(table);
//       break;
//     case 'PostgreSQL':
//       columnsQuery = postgresColumnsQuery(table);
//       break;
//     case 'SQLite':
//       columnsQuery = sqliteColumnsQuery(table);
//       break;
//     default:
//       throw new Error('Unexpected database for quering columns');
//   }

//   return columnsQuery;
// }

// function mysqlColumnsQuery(table: string) {
//   return `
//     SELECT COLUMN_NAME, DATA_TYPE
//       FROM INFORMATION_SCHEMA.COLUMNS
//       WHERE table_name = '${table}';
//   `;
// }

// function postgresColumnsQuery(table: string) {
//   return `
//     SELECT column_name, data_type
//       FROM information_schema.columns
//       WHERE table_name = '${table}';
//   `;
// }

// function mssqlColumnsQuery(table: string) {
//   return `
//     SELECT COLUMN_NAME, DATA_TYPE
//       FROM INFORMATION_SCHEMA.COLUMNS
//       WHERE TABLE_NAME = '${table}';
//   `;
// }

// function sqliteColumnsQuery(table: string) {
//   return `PRAGMA table_info(${table})`;
// }
