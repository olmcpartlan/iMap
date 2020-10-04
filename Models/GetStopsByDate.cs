using MetraApi.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using TimeZoneConverter;

// The main idea here is to use sql queries for the larger datasets (stop_times, routes) as they're 
// not likely to change. 

// Using http requests for smaller things like metra alerts, schedule announcements, or anything that is subject to update quickly


namespace MetraApi.Controllers
{
  [Route("metra")]
  public class StopsByDate : ControllerBase
  {
    [HttpPost("stopsbydate")]
    public List<MetraStopTime> GetTimesOndate([FromBody] object body)
    {
      // body contains the departure id and destination id 

      Dictionary<string, string> stopIds = JsonConvert.DeserializeObject<Dictionary<string, string>>(body.ToString());


      JsonSerializer serializer = new JsonSerializer();

      using (SqlConnection connection = Configurations.CreateSqlConnection())
      {
        using (SqlCommand command = new SqlCommand("[dbo].[GetTimesToday]", connection))
        {
          command.CommandType = System.Data.CommandType.StoredProcedure;
          command.Parameters.AddWithValue("@departure", stopIds["selectedDestinationId"]);
          command.Parameters.AddWithValue("@destination", stopIds["selectedDepartureId"]);

          connection.Open();

          List<MetraStopsWithDays> metraStopsWithDays = new List<MetraStopsWithDays>();

          using (SqlDataReader reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              metraStopsWithDays.Add(new MetraStopsWithDays()
              {
                stop_id = reader.GetString(0),
                trip_id = reader.GetString(1),
                arrival_time = reader.GetString(2),
                stop_name = reader.GetString(3),
                stop_lat = reader.GetDouble(4),
                stop_lon = reader.GetDouble(5),
                zone_id = reader.GetString(6),
                service_id = reader.GetString(7),
                stop_sequence = reader.GetString(8),
                monday = reader.GetString(9),
                tuesday = reader.GetString(10),
                wednesday = reader.GetString(11),
                thursday = reader.GetString(12),
                friday = reader.GetString(13),
                saturday = reader.GetString(14),
                sunday = reader.GetString(15),

              });


            }
          }

          // Since one of the column is lagged into the next row, there will always be a null previous sequence on the first row
          MetraStopsWithDays null_previous = metraStopsWithDays.FirstOrDefault(s => s.previous_sequence == null);
          metraStopsWithDays.Remove(null_previous);

          // get the stops that have the selected departure and destination
          List<MetraStopsWithDays> stopsWithDestination = new List<MetraStopsWithDays>();
          List<MetraStopTime> finalStopInformation = new List<MetraStopTime>();

          // still need to filter a lot
          foreach (MetraStopsWithDays stop in metraStopsWithDays)
          {
            Console.WriteLine(metraStopsWithDays.IndexOf(stop));
            // splits the stops into destination and departure
            MetraStopsWithDays[] commonTrips = metraStopsWithDays.Where(s => s.trip_id == stop.trip_id).ToArray();

            // unfortunately the date data is stored in day of the week columns with bools
            // this gets the stops running today


            DateTime selectedDate = DateTime.Parse(stopIds["selectedDate"]);
            string selectedDayOfWeek = selectedDate.DayOfWeek.ToString().ToLower();


            string runsOnSelectedDate = stop.GetType().GetProperty(selectedDayOfWeek).GetValue(stop, null).ToString();


            if (runsOnSelectedDate == "1")
            {
              if (commonTrips.Count() > 1)
              {
                string formattedDepartureTime = "";
                string formattedDestinationTime = "";

                string formattedDepartureDate = "";
                string formattedDestinationDate = "";


                // some stops have a destination time of 25:20.. not sure why

                try
                {
                  formattedDepartureTime = DateTime.Parse(commonTrips[0].arrival_time).ToShortTimeString();
                  formattedDestinationTime = DateTime.Parse(commonTrips[1].arrival_time).ToShortTimeString();

                }
                catch
                {
                  // if a time is something like 25:45, we can just ignore it 
                  continue;
                }

                DateTime currentTime = DateTime.Now;

                TimeZoneInfo.ConvertTimeBySystemTimeZoneId(currentTime, "Central Standard Time");

                // compare the first hours of the departure time and current time. 
                // destination could be 2 am in the next morning so we dont want to compare it
                int currentHour = int.Parse(currentTime.ToShortTimeString().Split(':')[0]);
                int departureHour = int.Parse(formattedDepartureTime.Split(':')[0]);


                finalStopInformation.Add(new MetraStopTime()
                {
                  trip_id = commonTrips[0].trip_id,

                  departure_id   = commonTrips[0].stop_id,
                  departure_name = commonTrips[0].stop_name,
                  departure_time = formattedDepartureTime,


                  destination_id   = commonTrips[1].stop_id,
                  destination_name = commonTrips[1].stop_name,
                  destination_time = formattedDestinationTime,

                });

              }

            }

          }

          DateTime newTime = DateTime.Now;


          connection.Close();

          // this gives us distinct times
          return finalStopInformation.GroupBy(x => x.departure_time)
                                     .Select(group => group.First())
                                     .ToList();

        }
      }

    }


    [HttpPost("selected-trip-stops/{trip_id}")]
    public List<MetraStopName> GetAllStopsByTripWithDate(string trip_id)
    {
      // extract the trip_id value from the request body

      // use the trip id to get current stop, stop alerts, center boarding, etc..
      using(SqlConnection conn = Configurations.CreateSqlConnection())
      {
        conn.Open();

        using(SqlCommand cmd = conn.CreateCommand())
        {
          cmd.CommandText = $"SELECT * FROM stop_times WHERE trip_id = '{trip_id}'";

          using(SqlDataReader reader = cmd.ExecuteReader())
          {
            List<MetraStopName> stops = new List<MetraStopName>();

            while(reader.Read())
            {
              stops.Add(new MetraStopName()
              {
                trip_id = reader.GetString(0),
                arrival_time = reader.GetString(1),
                departure_time = reader.GetString(2),
                stop_id = reader.GetString(3),

                stop_sequence = reader.GetString(4),
                pickup_type = reader.GetString(5),
                drop_off_type = reader.GetString(6),
                center_boarding = reader.GetString(7),
                south_boarding = reader.GetString(8),
                bikes_allowed = reader.GetString(9),
                notice = reader.GetString(10),
              });
            }


            return stops
              .GroupBy(s => s.departure_time)
              .Select(g => g.First())
              .ToList();
          }
        }
      }


    }
  }
}
