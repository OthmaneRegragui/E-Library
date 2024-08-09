import React, { useState } from 'react';

const Table = ({ data, columns, search = false, searchArgs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState(searchArgs[0]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchFieldChange = (event) => {
    setSearchField(event.target.value);
  };

  const handleSortClick = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredData = search
    ? data.filter((row) => {
        const searchValue = row[searchField].toString().toLowerCase();
        return searchValue.includes(searchTerm.toLowerCase());
      })
    : data;

  const sortedData = filteredData.slice().sort((a, b) => {
    if (sortColumn === null) return 0;
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  const baseInputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 sm:w-1/4  focus:ring-green-500 focus:border-transparent';
  return (
    <div className="w-full overflow-x-auto">
      {search && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Search..."
            className="border border-slate-600 rounded-md px-2 py-1 w-full sm:w-3/4 text-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
          <select
            className={`${baseInputClass}`}
            value={searchField}
            onChange={handleSearchFieldChange}
          >
            {searchArgs.map((field) => {
              const title =
                columns.find((column) => column.field === field)?.title || field;
              return (
                <option key={field} value={field}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-spacing-2 text-lg">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key || column.field}
                  className="border border-slate-600 rounded-md cursor-pointer px-2 py-1 whitespace-nowrap"
                  onClick={() => handleSortClick(column.field)}
                >
                  {column.title || column.field}
                  {sortColumn === column.field && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? '⬆️' : '⬇️'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={row.id || row._id} className="h-8">
                {columns.map((column) => (
                  <td
                    key={column.key || column.field}
                    className="border border-slate-700 text-center px-2 py-1"
                  >
                    {column.render ? column.render(row) : row[column.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
