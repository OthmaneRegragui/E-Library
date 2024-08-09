import React from 'react';

const Info = ({ data }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <tbody className="bg-white divide-y divide-gray-200">
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{key}</td>
            <td className="px-6 py-4 whitespace-nowrap">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Info;
