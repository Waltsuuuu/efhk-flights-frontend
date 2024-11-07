import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./App.css";

const App = () => {
  const [flights, setFlights] = useState([]); // All flights data
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Index for the current page
  const flightsPerPage = 5;
  const [error, setError] = useState(null);
  const timeZone = "Europe/Helsinki";
  const date = new Date();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch flight data
  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        const response = await axios.get(
          "https://efhk-flights-backend.onrender.com/api/flights"
        );
        const sortedFlights = response.data.flights.sort(
          (a, b) => new Date(a.estimatedArrival) - new Date(b.estimatedArrival)
        );
        setFlights(sortedFlights);
        setIsLoading(false);

        console.log("Flight data fetched");

        // Find index of the flight closest to the current time
        const currentTime = new Date();
        const closestIndex = sortedFlights.findIndex(
          (flight) => new Date(flight.estimatedArrival) >= currentTime
        );
        setCurrentPageIndex(
          Math.max(closestIndex - Math.floor(flightsPerPage / 2), 0)
        ); // Start with 5 flights centered around the current time
      } catch (err) {
        setError("Unable to fetch flights...");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchFlightData(); // Fetch initial flight data

    // Set up an interval to fetch the data every 1 minute
    const interval = setInterval(fetchFlightData, 60000);
    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timeZone,
    });
  };

  // Calculate start and end indices for the current page
  const startIndex = currentPageIndex;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = flights.slice(startIndex, endIndex);

  // Function to move down the "ladder" (later flights)
  const nextPage = () => {
    if (endIndex < flights.length) {
      setCurrentPageIndex((prevIndex) => prevIndex + flightsPerPage);
    }
  };

  // Function to move up the "ladder" (earlier flights)
  const prevPage = () => {
    if (startIndex > 0) {
      setCurrentPageIndex((prevIndex) =>
        Math.max(prevIndex - flightsPerPage, 0)
      );
    }
  };
  /*
  if (error) {
    return <div>{error}</div>;
  }
*/
  return (
    <div className="flight-list">
      <h1>Helsiki Airport - Arriving Flights</h1>
      {/* Date */}
      <div className="date">{date.toLocaleDateString()}</div>

      {/* Header */}
      <div className="flight-row-header">
        <div className="flight-time-header">Time</div>
        <div className="flight-info-header">Flight</div>
        <div className="flight-status-header">Status</div>
      </div>

      {/* Display the flights */}
      <div className="flight-card">
        {/* Button to show earlier flights */}
        <div className="button-container">
          {startIndex > 0 && (
            <button className="prev-button" onClick={prevPage}>
              Show Earlier Flights <FontAwesomeIcon icon={faChevronUp} />
            </button>
          )}
        </div>

        {isLoading && (
          <p className="loading-and-error-display">Loading flights...</p>
        )}

        {error && <p className="loading-and-error-display">{error}</p>}

        {currentFlights.map((flight, index) => (
          <div key={index} className="flight-item">
            <div className="flight-time">
              {formatDate(flight.estimatedArrival)}
            </div>
            <div className="flight-info">
              <h2>{flight.flightRoute}</h2>
              <p>{flight.flightNumber}</p>
            </div>
            <div
              className={`flight-status ${
                flight.landed === "Landed"
                  ? "landed"
                  : flight.landed === "Delayed"
                  ? "delayed"
                  : flight.landed === "approaching" //We want to display "Approaching" as landed, since users dont need to know if the flight is approaching
                  ? "landed"
                  : flight.landed === "Canceled"
                  ? "canceled"
                  : "estimated"
              }`}
            >
              {flight.landed === "Landed" ? (
                <div className="landed-status">
                  LANDED {formatDate(flight.estimatedArrival)}
                </div>
              ) : flight.landed === "Delayed" ? (
                <div className="delayed-status">
                  DELAYED {formatDate(flight.estimatedArrival)}
                </div>
              ) : flight.landed === "Cancelled" ? (
                <div className="cancelled-status">CANCELLED</div>
              ) : (
                <div className="estimated-status">
                  ESTIMATED {formatDate(flight.estimatedArrival)}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Button to show later flights */}
        <div className="button-container">
          {endIndex < flights.length && (
            <button className="next-button" onClick={nextPage}>
              Show Later Flights <FontAwesomeIcon icon={faChevronDown} />
            </button>
          )}
        </div>
      </div>

      <p className="credits">
        This web app is a personal project created solely for educational and
        web development practice purposes.
        <br />
        <br /> It uses publicly available data from the Finavia Public Flights
        v0 API, but it is not affiliated with or endorsed by Finavia in any way.
        <br />
        <br />
        All data and information displayed are for demonstration purposes only.
      </p>
    </div>
  );
};

export default App;
