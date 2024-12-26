// forecast.js
document.addEventListener("DOMContentLoaded", function () {
  //const loadWeatherButton = document.getElementById('load-weather');
  const SunsetSunriseSuggestionBtn = document.getElementById("sunset-sunrise");
  //const PrecipButton = document.getElementById('precipitation');
  const PrecipProbButton = document.getElementById("precipprob");
  const MeteorsButton = document.getElementById("meteors");

  //Historical weather
  /*
    loadWeatherButton.addEventListener('click', function () {
        const cityZipCode = document.getElementById('city').value;
        if (!cityZipCode) {
            alert("Please select camping spot!");
            document.getElementById('forecast-container').innerHTML = "";
        }
        else {
            //decide endpoint
            const endpoint = cityZipCode ? `/weather?zip=${cityZipCode}` : '/weather';
            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById('forecast-container');
                    container.innerHTML = ''; // Clear previous results
                    const days = data[0]?.days; // Adjust based on your actual data structure
                    const monthlyStats = calculateMonthlyStats(days);

                    Object.keys(monthlyStats).forEach(month => {
                        const stats = monthlyStats[month];
                        const card = document.createElement('div');
                        card.className = 'forecast-card';

                        const monthEl = document.createElement('h2');
                        monthEl.textContent = `Month: ${month}`;
                        card.appendChild(monthEl);

                        const avgTempEl = document.createElement('p');
                        avgTempEl.textContent = `Average Temperature: ${stats.avgTemp}°C`;
                        card.appendChild(avgTempEl);

                        const totalPrecipEl = document.createElement('p');
                        totalPrecipEl.textContent = `Total Precipitation: ${stats.totalPrecip}mm`;
                        card.appendChild(totalPrecipEl);

                        const maxWindGustEl = document.createElement('p');
                        maxWindGustEl.textContent = `Max Wind Gust: ${stats.maxWindGust}km/h`;
                        card.appendChild(maxWindGustEl);

                        container.appendChild(card);

                        // Call the drawBarChart function to draw the bar chart with the monthly stats
                        //drawBarChart(monthlyStats);
                    });
                })
                .catch(error => console.error('Error fetching forecast:', error));
        }
    });
    */

  // ----------- Sunrise and Sunset -------------
  SunsetSunriseSuggestionBtn.addEventListener("click", function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to the start of the day
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    // console.log("today: " + today + ", type:" + typeof(today));
    // console.log("sevenDaysFromNow: " + sevenDaysFromNow + ", type:" + typeof(sevenDaysFromNow));

    const cityZipCode = document.getElementById("city").value;
    // console.log(cityZipCode);
    if (!cityZipCode) {
      alert("Please select camping spot!");
      document.getElementById("forecast-container").innerHTML = "";
    } else {
      const endpoint = cityZipCode
        ? `/sunset-sunrise-forecast?zip=${cityZipCode}`
        : "/weather";
      fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
          const container = document.getElementById("forecast-container");
          container.innerHTML = ""; // Clear previous results
          const days = data[0]?.days; // Adjust based on your actual data structure
          const monthlyStats = calculateMonthlyStats(days);

          const filteredDays = days.filter((day) => {
            const dayDate = new Date(day.datetime); // Assume day.datetime is in ISO format e.g. '2023-01-01'
            return dayDate >= today && dayDate < sevenDaysFromNow;
          });

          const analyzedDays = filteredDays.map(day => {
              return {
                  ...day,
                  visibilityDesc: categorizeVisibility(day.visibility),
                  cloudcoverDesc: categorizeCloudCover(day.cloudcover),
                  sunrise_sunsetDesc: calculateSunriseSunsetVisibility(
                      categorizeVisibility(day.visibility),
                      categorizeCloudCover(day.cloudcover)
                  ),
                  chaceToWatchSunriseSunset: chancetoWatchSunriseSunset(
                      categorizeVisibility(day.visibility),
                      categorizeCloudCover(day.cloudcover)),
                  windgustDesc: categorizeWindGust(day.windgust),
                  temp_fahrenheit: celsiusToFahrenheit(day.temp),
              };
          });
          //console.log(analyzedDays);

          analyzedDays.forEach((day) => {
            const card = document.createElement("div");
            card.className = "forecast-card";

            const dateEl = document.createElement("h2");
            dateEl.textContent = `${day.datetime}`;
            card.appendChild(dateEl);
            
            const sunriseEl = document.createElement('p');
            sunriseEl.textContent = `Sunrise: ${day.sunrise}`;
            card.appendChild(sunriseEl);

            const sunsetEl = document.createElement('p');
            sunsetEl.textContent = `Sunset: ${day.sunset}`;
            card.appendChild(sunsetEl);

            const tempEl = document.createElement("p");
            tempEl.textContent = `Temperature: ${day.temp}°C (${day.temp_fahrenheit}°F)`;
            card.appendChild(tempEl);
            
            const windEl = document.createElement('p');
            windEl.textContent = `Windgust: ${day.windgust}mph (${day.windgustDesc})`;
            card.appendChild(windEl);

            const visibilityDescEl = document.createElement("p");
            visibilityDescEl.textContent = `Visibility: ${day.visibilityDesc}`;
            card.appendChild(visibilityDescEl);

            const cloudcoverDescEl = document.createElement("p");
            cloudcoverDescEl.textContent = `Cloud Cover: ${day.cloudcoverDesc}`;
            card.appendChild(cloudcoverDescEl);

            const chanceToWatchSunriseSunsetEl = document.createElement("p");
            chanceToWatchSunriseSunsetEl.textContent = `Chance to Watch Sunrise/Sunset: ${day.chaceToWatchSunriseSunset}`;
            card.appendChild(chanceToWatchSunriseSunsetEl);

            container.appendChild(card);
          });

          // Create and append the chart container
          const chartContainer = document.createElement("div");
          chartContainer.id = "chart-container";
          container.appendChild(chartContainer);
          drawChanceToWatchChart(analyzedDays);
        })
        .catch((error) => console.error("Error fetching forecast:", error));
    }
  });

  //PrecipButton
  /* 
    PrecipButton.addEventListener('click', function () {
        const cityZipCode = document.getElementById('city').value;
        if (!cityZipCode) {
            alert("Please select City!");
            document.getElementById('forecast-container').innerHTML = "";
        }
        else {
            //decide endpoint
            const endpoint = cityZipCode ? `/weather?zip=${cityZipCode}` : '/precipitation';
            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById('forecast-container');
                    container.innerHTML = ''; // Clear previous results
                    const days = data[0]?.days; // Adjust based on your actual data structure
                    const monthlyStats = calculateMonthlyStats(days);

                    Object.keys(monthlyStats).forEach(month => {
                        const stats = monthlyStats[month];
                        const card = document.createElement('div');
                        card.className = 'forecast-card';

                        const monthEl = document.createElement('h2');
                        monthEl.textContent = `Month: ${month}`;
                        card.appendChild(monthEl);

                        const avgTempEl = document.createElement('p');
                        avgTempEl.textContent = `Average Temperature: ${stats.avgTemp}°C`;
                        //card.appendChild(avgTempEl);

                        const totalPrecipEl = document.createElement('p');
                        totalPrecipEl.textContent = `Total Precipitation: ${stats.totalPrecip}mm`;
                        card.appendChild(totalPrecipEl);

                        const avgPrecipEl = document.createElement('p');
                        avgPrecipEl.textContent = `Average Precipitation: ${stats.avgPrecip}mm`;
                        card.appendChild(avgPrecipEl);
                      
                        const maxWindGustEl = document.createElement('p');
                        maxWindGustEl.textContent = `Max Wind Gust: ${stats.maxWindGust}km/h`;
                      
                        const avgHumidityEl = document.createElement('p');
                        avgHumidityEl.textContent = `Average Humidity: ${stats.avgHumidity}%`;  
                      
                        card.appendChild(avgHumidityEl);

                        container.appendChild(card);

                        // Call the drawBarChart function to draw the bar chart with the monthly stats
                        //drawBarChart(monthlyStats);
                    });
                })
                .catch(error => console.error('Error fetching forecast:', error));
        }
    });
    */
  
  // ----------- Precipitation Probability -------------
  PrecipProbButton.addEventListener("click", function () {
    const cityZipCode = document.getElementById("city").value;
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (!cityZipCode) {
      alert("Please select camping spot!");
      document.getElementById("forecast-container").innerHTML = "";
    } else {
      const endpoint = cityZipCode
        ? `/precipprob?zip=${cityZipCode}`
        : "/precipprob";
      fetch(endpoint)
        .then((response) => response.json())
        .then((data) => {
          const container = document.getElementById("forecast-container");
          container.innerHTML = ""; // Clear previous results
          //const sevenDaysData = data.slice(0, 7);
          const filteredDays = data.filter((day) => {
            const dayDate = new Date(day.date);
            return dayDate >= today && dayDate < sevenDaysFromNow;
          });
          //console.log("Filtered Data for the next 7 days:", filteredDays);

          const processedData = processData(filteredDays);
          //console.log("Processed Data for the next 7 days:", processedData);

          processedData.forEach((dayData) => {
            const card = document.createElement("div");
            card.className = "forecast-card";

            const dateEl = document.createElement("h2");
            dateEl.textContent = `${dayData.date}`;
            card.appendChild(dateEl);

            const morningPrecipEl = document.createElement("p");
            morningPrecipEl.textContent = `Morning Prob: ${dayData.morningProb}%`; //Precipitation Probability
            card.appendChild(morningPrecipEl);

            const morningSugg = document.createElement("p");
            morningSugg.textContent = `${dayData.morningSuggestion}`;
            card.appendChild(morningSugg);

            const afternoonPrecipEl = document.createElement("p");
            afternoonPrecipEl.textContent = `Afternoon Prob: ${dayData.afternoonProb}%`;
            card.appendChild(afternoonPrecipEl);

            const afterSugg = document.createElement("p");
            afterSugg.textContent = `${dayData.afternoonSuggestion}`;
            card.appendChild(afterSugg);

            const eveningPrecipEl = document.createElement("p");
            eveningPrecipEl.textContent = `Evening Prob: ${dayData.eveningProb}%`;
            card.appendChild(eveningPrecipEl);

            const eveningSugg = document.createElement("p");
            eveningSugg.textContent = `${dayData.eveningSuggestion}`;
            card.appendChild(eveningSugg);

            container.appendChild(card);
          });

          // Create and append the chart container
          const chartContainer = document.createElement("div");
          chartContainer.id = "chart-container";
          container.appendChild(chartContainer);
          drawD3Chart_2(processedData);
        })
        .catch((error) => console.error("Error fetching forecast:", error));
    }
  });

  // ----------- Meteors -------------
MeteorsButton.addEventListener("click", function () {
    const container = document.getElementById("forecast-container");
    container.innerHTML = "";

    const results = {};

    const endpoint = "/meteors"; // Adjust this to your actual API endpoint

    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to the start of the day

        // Initialize future dates
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 3); // Set the limit to three days from today

        data.forEach((entry) => {
          const entryDateTime = new Date(entry.datetime);
          const dateKey = entryDateTime.toISOString().split('T')[0];// Format YYYY-MM-DD
          const zipcode = entry.name.substring(0, 5);
          console.log(entry);
          // Check if the date is within the specified range and conditions are met
          if (entryDateTime >= today && entryDateTime < endDate) {
            // If no record for the day or found a better option, update it
            if (!results[dateKey] || entry.cloudcover < results[dateKey].cloudcover) {
              results[dateKey] = {
                name: findCampground(zipcode),
                cloudcover: entry.cloudcover,
                sunrise: entry.sunrise,
                datetime: entry.datetime, // To verify the dates processed
                zipcode: zipcode
              };
              //console.log(results[dateKey]);
            }
          }
        });
        //console.log(results);
        // Generate HTML content for display
        let cardHTML = '<div class="forecast-card-2"><h2>Meteor Viewing Forecast</h2><p>Lowest cloud cover locations:</p>';
        Object.keys(results).sort().forEach(date => {
          cardHTML += `<p>${date}: ${results[date].name} with ${results[date].cloudcover}% cloud cover, sunrise at ${results[date].sunrise}</p>`;
        });
        cardHTML += '</div>';

        // Append the card to the forecast container
        container.innerHTML = cardHTML;
      })
      .catch((error) => {
        console.error("Error fetching forecast:", error);
        container.innerHTML = "<p>Error fetching data. Please try again later.</p>";
      });
});


  // Function to calculate average
  function calculateAverage(array) {
    //console.log("array:" + array);
    //console.log("array.length:" + array.length);
    if (array.length === 0) return 0; // Prevent division by zero
    const sum = array.reduce((acc, val) => acc + val, 0);
    return sum / array.length;
  }

  // Function to process data
  function processData(data) {
    const processedData = [];

    // First, we need to group the data by date as the original structure doesn't do this
    const groupedByDate = data.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});

    // Now we have the data grouped by date, we can process each date
    Object.keys(groupedByDate).forEach((date) => {
      const entries = groupedByDate[date];

      // Filter entries by the defined time ranges and calculate average precipitation probability
      const morningEntries = entries.filter(
        (e) => e.time >= "07:00:00" && e.time < "12:00:00"
      );
      const afternoonEntries = entries.filter(
        (e) => e.time >= "12:00:00" && e.time < "17:00:00"
      );
      const eveningEntries = entries.filter(
        (e) => e.time >= "17:00:00" && e.time < "22:00:00"
      );

      const morningProb = calculateAverage(
        morningEntries.map((e) => e.precipprob)
      ).toFixed(2);
      const afternoonProb = calculateAverage(
        afternoonEntries.map((e) => e.precipprob)
      ).toFixed(2);
      const eveningProb = calculateAverage(
        eveningEntries.map((e) => e.precipprob)
      ).toFixed(2);

      // Create the result object with suggestions based on the precipitation probability
      const result = {
        date: date,
        morningProb: morningProb,
        morningSuggestion:
          morningProb > BringUmberlla.MEDIUM.value
            ? BringUmberlla.MEDIUM.text
            : "No umbrella needed",
        afternoonProb: afternoonProb,
        afternoonSuggestion:
          afternoonProb > BringUmberlla.MEDIUM.value
            ? BringUmberlla.MEDIUM.text
            : "No umbrella needed",
        eveningProb: eveningProb,
        eveningSuggestion:
          eveningProb > BringUmberlla.MEDIUM.value
            ? BringUmberlla.MEDIUM.text
            : "No umbrella needed",
      };

      processedData.push(result);
    });

    return processedData;
  }

  function calculateMonthlyStats(days) {
    let monthlyStats = {};

    days.forEach((day) => {
      const month = day.datetime.substring(0, 7); // YYYY-MM

      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          totalTemp: 0,
          totalPrecip: 0,
          maxWindGust: 0,
          totalHumidity: 0,
          count: 0,
        };
      }
      monthlyStats[month].totalTemp += day.temp;
      monthlyStats[month].totalPrecip += day.precip || 0;
      monthlyStats[month].maxWindGust = Math.max(
        monthlyStats[month].maxWindGust,
        day.windgust || 0
      );
      monthlyStats[month].totalHumidity += day.humidity;
      monthlyStats[month].count++;
    });

    // Calculate averages
    Object.keys(monthlyStats).forEach((month) => {
      monthlyStats[month].avgTemp = (
        monthlyStats[month].totalTemp / monthlyStats[month].count
      ).toFixed(2);
      monthlyStats[month].totalPrecip =
        monthlyStats[month].totalPrecip.toFixed(2);
      monthlyStats[month].avgPrecip = (
        monthlyStats[month].totalPrecip / monthlyStats[month].count
      ).toFixed(2);
      monthlyStats[month].maxWindGust =
        monthlyStats[month].maxWindGust.toFixed(2);
      monthlyStats[month].avgHumidity = (
        monthlyStats[month].totalHumidity / monthlyStats[month].count
      ).toFixed(2);
    });

    return monthlyStats;
  }

  function drawBarChart(monthlyStats) {
    const monthAbbreviations = [
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "Jun.",
      "Jul.",
      "Aug.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];
    const svgElement = d3.select("#temp-bar-chart");
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    //const width = +svgElement.style('width').slice(0, -2) - margin.left - margin.right; // Parse width from style attribute
    //const height = +svgElement.style('height').slice(0, -2) - margin.top - margin.bottom; // Parse height from style attribute

    // Account for margins when setting width and height
    const width =
      parseInt(svgElement.style("width")) - margin.left - margin.right;
    const height =
      parseInt(svgElement.style("height")) - margin.top - margin.bottom;

    // Clear any previous SVG content
    svgElement.selectAll("*").remove();

    const xScale = d3
      .scaleBand()
      .domain(monthAbbreviations) // Use month abbreviations for domain
      .range([0, width])
      .padding(0.1);

    // Define the scales
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(monthlyStats), (d) => d.avgTemp) * 4]) // Multiply by 1.1 to add some space at the top
      .range([height, 0]);

    const g = svgElement
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Bars
    g.selectAll("rect")
      .data(Object.values(monthlyStats))
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale(monthAbbreviations[i]))
      .attr("y", (d) => yScale(d.avgTemp))
      .attr("width", xScale.bandwidth() - 5)
      .attr("height", (d) => height - yScale(d.avgTemp))
      .attr("fill", "steelblue");

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Y Axis
    g.append("g").call(d3.axisLeft(yScale).ticks(10)).append("text");

    // Adding text labels for each bar
    g.selectAll(".text")
      .data(Object.values(monthlyStats))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr(
        "x",
        (d, i) => xScale(monthAbbreviations[i]) + xScale.bandwidth() / 2
      )
      .attr("y", (d) => yScale(d.avgTemp) - 5)
      .attr("text-anchor", "middle")
      .text((d) => d.avgTemp + "°C")
      .attr("font-size", "10px");

    // Y-Axis Title
    g.append("text")
      .attr("transform", "rotate(-90)") // Rotate the text for vertical y-axis title
      .attr("y", 0 - margin.left) // Position it to the left of the y-axis
      .attr("x", 0 - height / 2) // Center it vertically
      .attr("dy", "1em") // Adjust distance from the axis
      .style("text-anchor", "middle") // Center the text horizontally
      .text("Average Temperature (°C)"); // The subtitle text for the y-axis

    // X-Axis Title
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`) // Position it below the x-axis
      .style("text-anchor", "middle") // Center the text horizontally
      .text("Months of the Year"); // The subtitle text for the x-axis
  }

  // Q1
  function drawChanceToWatchChart(data) {
    //console.log(data);
    // Parse the percentage ranges and calculate midpoints
    const processedData = data.map((d) => {
      const range = d.chaceToWatchSunriseSunset
        .split("-")
        .map((p) => parseFloat(p));
      const midpoint = (range[0] + range[1]) / 2;
      return {
        date: d.datetime,
        chanceMidpoint: midpoint,
      };
    });

    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 70, left: 40 }, // Increased bottom margin to accommodate horizontal labels
      width = 760 - margin.left - margin.right, // Reduced width to decrease the width of bars
      height = 500 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    const svg = d3
      .select("#chart-container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(processedData.map((d) => d.date))
      .padding(0.1); // Decreased padding to reduce the width of bars
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(0,0)rotate(0)") // Horizontal text
      .style("text-anchor", "middle"); // Center the text below the tick

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Bars
    svg
      .selectAll("mybar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.date))
      .attr("y", (d) => y(d.chanceMidpoint))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.chanceMidpoint))
      .attr("fill", "#ABD0CE");

    // Optional: Add the Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Chance to Watch Sunrise/Sunset (%)");
  }

  // Q2:Function to draw D3 grouped bar chart
  function drawD3Chart_2(processedData) {
    // Define the dimensions and margins of the graph
    const margin = { top: 30, right: 30, bottom: 70, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Append the SVG object to the body of the page
    const svg = d3
      .select("#chart-container") //forecast-container
      .insert("svg", ":first-child") // Insert svg at the top of the container
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define subgroups (morning, afternoon, evening)
    const subgroups = ["morningProb", "afternoonProb", "eveningProb"];

    // Define the group which is the date here
    const groups = processedData.map((d) => d.date);

    // X axis: scale and draw:
    const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));

    // Add Y axis and title
    const yAxis = svg.append("g").call(d3.axisLeft(y));

    // Add a label to the Y axis
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Precipitation Probability (%)"); // The label text for Y axis

    // Another scale for subgroup position
    const xSubgroup = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding([0.05]);

    // Color scale for subgroups
    const color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(["#8EC0E4", "#D09E88", "#ABD0CE"]);

    // Show the bars
    svg
      .append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(processedData)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x(d.date)}, 0)`)
      .selectAll("rect")
      .data(function (d) {
        return subgroups.map(function (key) {
          return { key: key, value: d[key] };
        });
      })
      .enter()
      .append("rect")
      .attr("x", (d) => xSubgroup(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => color(d.key));
  }

  const Visibility = {
    EXCELLENT: {
      value: 20,
      text: "Excellent",
      description: "Excellent - Ideal conditions",
    },
    GOOD: {
      value: 10,
      text: "Good",
      description: "Good - Suitable for watching sunrise",
    },
    MODERATE: {
      value: 4,
      text: "Moderate",
      description: "Moderate - Some haze or light fog might be present",
    },
    POOR: {
      value: 1,
      text: "Poor",
      description:
        "Poor - Fog, mist, or heavy precipitation is limiting visibility significantly",
    },
    VERY_POOR: {
      value: 0,
      text: "Very Poor",
      description: "Very Poor - Severe weather conditions",
    },
  };

  const CloudCover = {
    EXCELLENT: {
      value: 10,
      text: "Clear Skies",
      description: "Optimal conditions for sky watching",
    },
    GOOD: {
      value: 30,
      text: "Mostly Clear",
      description: "Mostly unobstructed view of the sky",
    },
    MODERATE: {
      value: 70,
      text: "Partly Cloudy",
      description: "Variable conditions: partially obscured",
    },
    POOR: {
      value: 90,
      text: "Mostly Cloudy",
      description:
        "Sunrises are likely to be obscured, though some colors might still be visible",
    },
    VERY_POOR: {
      value: 100,
      text: "Overcast",
      description:
        "The sky is fully covered by clouds, making it unlikely to view the sunrise directly",
    },
  };
  
  const Windgust = {
        Calm: { value: 10, text: "Calm" },          // (<6mph)
        Light: { value: 30, text: "Light" },        //(6-10mpgh)
        Moderate: { value: 50, text: "Moderate" },  //(19-31mph)
        Strong: { value: 70, text: "Strong" },      //(31-43mph)
        Severe: { value: 90, text: "Severe" },      //(43-56mph)
        Extreme: { value: 90, text: "Extreme" },    //(Over 56mph)
        //Very_Hot : { value: 50, text: "Warm "},
    };
  
  const CampgroundZip = {
        15010: "Hart's Content Campground",
        15017: "Cecil Henderson Montour Trail Campground",
        15018: "Queen Aliquippa Camp",
        15022: "Pine Cove Beach Club & RV Resort",
        15026: "Tri-State Holiness Association / Raccoon Creek State Park Campground",
        15089: "Gap Trail Campground LLC",
        15126: "Montour Trail Boggs Campsite",
        15129: "Montour Trail Campground",
        15135: "Yough Shore Inn",
        15143: "Henry's Camping spot",
        15205: "Faulk Campground",
        15215: "Camp Guyasuta - Boy Scouts of America",
        15301: "Washington / Pittsburgh SW KOA Journey / Whispering Pines Family",
        15479: "Cedar Creek Trekker Campground / Cedar Creek Park Scout Camping Area",
        15672: "Fox Den Acres Campgrounds",
        15679: "Madison / Pittsburgh S.E. KOA Journey",
        16053: "Buttercup Woodlands Campground"
    };

  const BringUmberlla = {
    LOW: { value: 25, text: "May Bring an umbrella" },
    MEDIUM: { value: 50, text: "Bring an umbrella" },
    HIGH: { value: 75, text: "Must bring an umberlla" },
  };

  function categorizeVisibility(visibility) {
    const object = [];
    if (visibility > Visibility.EXCELLENT.value) {
      return Visibility.EXCELLENT.text;
    } else if (visibility > Visibility.GOOD.value) {
      return Visibility.GOOD.text;
    } else if (visibility > Visibility.MODERATE.value) {
      return Visibility.MODERATE.text;
    } else if (visibility > Visibility.POOR.value) {
      return Visibility.POOR.text;
    } else if (visibility <= Visibility.POOR.value) {
      return Visibility.VERY_POOR.text;
    } else {
      return "Unknown - Visibility out of range";
    }
  }

  function categorizeCloudCover(cloudCover) {
    if (cloudCover < CloudCover.EXCELLENT.value) {
      return CloudCover.EXCELLENT.text;
    } else if (cloudCover < CloudCover.GOOD.value) {
      return CloudCover.GOOD.text;
    } else if (cloudCover < CloudCover.MODERATE.value) {
      return CloudCover.MODERATE.text;
    } else if (cloudCover < CloudCover.POOR.value) {
      return CloudCover.POOR.text;
    } else if (cloudCover >= CloudCover.POOR.value) {
      return CloudCover.VERY_POOR.text;
    } else {
      return "Unknown - CloudCover out of range";
    }
  }

  function calculateSunriseSunsetVisibility(visibility, cloudCover) {
    if (visibility === "Very Poor" || cloudCover === "Overcast") {
      return "Very Low";
    } else if (visibility === "Poor" || cloudCover === "Mostly Cloudy") {
      return "Low";
    } else if (visibility === "Moderate" || cloudCover === "Partly Cloudy") {
      return "Moderate";
    } else if (
      visibility === "Good" ||
      visibility === "Excellent" ||
      cloudCover === "Mostly Clear" ||
      cloudCover === "Clear Skies"
    ) {
      return "High";
    } else {
      return "Unknown";
    }
  }

  function chancetoWatchSunriseSunset(visibility, cloudCover) {
    if (visibility === 'Very Poor' || cloudCover === 'Overcast') {
            return '< 25%';     //Very Low
        } else if (visibility === 'Poor' || cloudCover === 'Mostly Cloudy') {
            return '25%-50%';   //Low
        } else if (visibility === 'Moderate' || cloudCover === 'Partly Cloudy') {
            return '50%-75%';   //Moderate
        } else if (visibility === 'Good' || visibility === 'Excellent' || cloudCover === 'Mostly Clear' || cloudCover === 'Clear Skies') {
            return '> 75%';      //Excellent
        } else {
            return 'Unknown';
        }
  }
  
  function categorizeWindGust(windgust) {
        if (windgust < Windgust.Calm.value) {
            return Windgust.Calm.text;
        } else if (windgust < Windgust.Light.value) {
            return Windgust.Light.text;
        } else if (windgust < Windgust.Moderate.value) {
            return Windgust.Moderate.text;
        } else if (windgust < Windgust.Strong.value) {
            return Windgust.Strong.text;
        } else if (windgust < Windgust.Severe.value) {
            return Windgust.Severe.text;
        } else if (windgust >= Windgust.Extreme.value) {
            return Windgust.Extreme.text;
        } else {
            return 'Unknown - Windgust out of range';
        }
    }
  
    function findCampground(zipCode) {
        const campground = CampgroundZip[zipCode];
        if (campground) {
            return campground;
        } else {
            return zipCode;
        }
    }
  
    function celsiusToFahrenheit(celsius){
        const temp_f = ((celsius * 9/5) + 32).toFixed(1);
        return temp_f;
    }
});
