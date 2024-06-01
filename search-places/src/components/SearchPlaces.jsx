import React, { useState, useEffect, useRef } from 'react';

const SearchPlaces = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (searchTerm.trim() !== '') {
            const delayTimer = setTimeout(() => {
                fetchCities();
            }, 300);

            return () => clearTimeout(delayTimer);
        } else setTotalPages(1)
    }, [searchTerm, pageSize, currentPage]);

    useEffect(() => {
        // Add event listener for keydown event
        document.addEventListener('keydown', handleKeyPress);

        // Remove event listener when component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const handleKeyPress = (event) => {
        // Check if Ctrl and / are pressed
        if (event.ctrlKey && event.key === '/') {
            // Focus the search input field
            searchInputRef.current.focus();
        }
    };

    const fetchCities = async () => {
        setLoading(true);
        const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=IN&namePrefix=${searchTerm}&limit=${pageSize}&offset=${(currentPage - 1) * pageSize}`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '42c72166camshb5a36be39038d3cp162addjsneab556b01645',
                'x-rapidapi-host': 'wft-geo-db.p.rapidapi.com',
            },
        };
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            setCities(result?.data);
            setTotalPages(Math.ceil(result?.metadata?.totalCount / pageSize));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePageSizeChange = (value) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    return (
        <div className="container">
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search Places..."
                    value={searchTerm}
                    onChange={handleSearch}
                    ref={searchInputRef} // Reference to the input field
                />
                <label className="shortcut-label">Ctrl + /</label>
            </div>
            <div id="cityTable" className="table-container">
                {loading && (
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                )}
                {!loading && searchTerm.trim() === '' && <div className="empty-text">Start searching</div>}
                {!loading && searchTerm.trim() !== '' && cities?.length === 0 && <div className="empty-text">No result found</div>}
                {!loading && searchTerm.trim() !== '' && cities?.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Place Name</th>
                                <th>Country</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cities?.map((city, index) => (
                                <tr key={city.id}>
                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{city.name}</td>
                                    <td>{city.country}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div id="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Prev
                </button>
                Page {currentPage} of {totalPages}
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
            <div>
                <label htmlFor="cityLimit">Items per page:</label>
                <input
                    type="number"
                    id="cityLimit"
                    min="1"
                    max="10"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                />
            </div>
        </div>
    );
};

export default SearchPlaces;
