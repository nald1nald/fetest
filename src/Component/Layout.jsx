import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import '../Styles/Styles.css';
import NoImage from '../Stuffs/Screenshot 2023-07-29 151431.png';

const SpaceXLaunches = () => {
  const [launches, setLaunches] = useState([]);
  const [visibleLaunches, setVisibleLaunches] = useState([]);
  const [loadedItems, setLoadedItems] = useState(6);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const observer = useRef();
  const lastLaunchRef = useRef();

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const response = await axios.get('https://api.spacexdata.com/v4/launches/');
        setLaunches(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLaunches();
  }, []);

  useEffect(() => {
    const filteredLaunches = launches.filter((launch) =>
      launch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setVisibleLaunches(filteredLaunches.slice(0, loadedItems));
  }, [searchQuery, launches, loadedItems]);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    observer.current = new IntersectionObserver(handleObserver, options);

    if (lastLaunchRef.current) {
      observer.current.observe(lastLaunchRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [visibleLaunches]);

  const handleObserver = (entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setLoading(true);
      setTimeout(() => {
        setLoadedItems((prevItems) => Math.min(prevItems + 5, launches.length));
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <Container className='thisBox'>
      <div className='searchBox'>
        <input
          type="search"
          name='search'
          placeholder='Enter Keyword'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className='flightDetails'>
        <ul>
          {visibleLaunches.map((launch, index) => (
            <li key={launch.flight_number} className="launch-item">
              {launch.links?.patch?.small && (
                <img
                  src={NoImage}
                  alt={`Mission Patch - ${launch.name}`}
                  className="mission-patch"
                />
              )}
              <div className="launch-details">
                <strong>Flight Number:</strong> {launch.flight_number}
                <strong> Mission Name: </strong> {launch.name}
                <strong> ({new Date(launch.date_utc).getFullYear()})</strong> <br />
                <strong>Flight Details:</strong> {launch.details || 'No details available.'}
                <br />
              </div>
              {index === visibleLaunches.length - 1 && (
                <div ref={lastLaunchRef} style={{ height: '1px', margin: '5px' }} />
              )}
            </li>
          ))}
        </ul>
      </div>

      {loading && <div className="loading-indicator">
        <img src="https://miro.medium.com/v2/resize:fit:441/1*8NJgObmgEVhNWVt3poeTaA.gif" alt="" />
      </div>}

    </Container>
  );
};

export default SpaceXLaunches;
