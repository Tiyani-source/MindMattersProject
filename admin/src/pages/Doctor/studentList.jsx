import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/student/view");
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    let matchType = true;
    let matchYear = true;

    if (filterType === 'university') {
      matchType = !!student.universityId;
    } else if (filterType === 'private') {
      matchType = !student.universityId;
    }

    if (filterYear !== 'all') {
      matchYear = student.year === parseInt(filterYear);
    }

    const matchSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase());

    return matchType && matchYear && matchSearch;
  });

  return (
    <div className='max-w-7xl mx-auto py-10 px-4 sm:px-8'>
      <h2 className='text-4xl font-extrabold mb-10 text-center text-indigo-600 drop-shadow'>🎓 Student Directory</h2>

      <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl shadow-lg mb-10 border border-indigo-100'>
        <div className='flex gap-4 flex-wrap justify-center sm:justify-start'>
          {['all', 'university', 'private'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-full transition text-sm font-semibold shadow-sm ${
                filterType === type ? 'bg-indigo-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {type === 'all' && '📚 All Students'}
              {type === 'university' && '🏛️ University Students'}
              {type === 'private' && '🧑‍💻 Private Learners'}
            </button>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto'>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value="all">🎓 All Years</option>
            {[1, 2, 3, 4].map(year => (
              <option key={year} value={year}>{year} Year</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="🔍 Search student by name..."
            className='p-2.5 w-full sm:w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow text-sm'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {filteredStudents.map((student) => (
          <div
            key={student._id}
            className='border border-indigo-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 p-4'
          >
            <p className='text-gray-800 text-lg font-bold'>{student.firstName} {student.lastName}</p>
            <p className='text-gray-500 text-sm'><strong>Year:</strong> {student.year}</p>
            <p className='text-gray-500 text-sm'><strong>Semester:</strong> {student.semester}</p>
            <p className='text-gray-500 text-sm'><strong>Email:</strong> {student.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentList;
