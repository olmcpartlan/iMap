using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security;
using System.Threading.Tasks;
using MetraApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Controller;
using Newtonsoft.Json;

namespace MetraApi.Controllers
{
  [Route("metra")]
  [ApiController]
  public class MetraController : ControllerBase
  {
    static HttpClient client = new HttpClient();

    [HttpGet("stops")]
    public async Task<Dictionary<string, string>> RequestMetra()
    {
      client = Configurations.CreateHttpConnection(client);

      string url = "https://gtfsapi.metrarail.com/gtfs/schedule/stops";

      HttpResponseMessage response = await client.GetAsync(url);
      string responseContent = await response.Content.ReadAsStringAsync();

      List<MetraStop> stops = new List<MetraStop>();

      stops = JsonConvert.DeserializeObject<List<MetraStop>>(responseContent);

      // the stop_id is used to reference the stop times in the db
      Dictionary<string, string> stopNames = new Dictionary<string, string>();

      stops.ForEach(stop =>
      {
        stopNames.Add(stop.stop_id, stop.stop_name);
      });

      client.DefaultRequestHeaders.Remove("Authorization");

      return stopNames;
    }

    [HttpPost("destinations")]
    public string GetDestinations([FromBody] object body)
    {
      // need to deserialize because the response can only come in as object
      Dictionary<string, string> departure = JsonConvert.DeserializeObject<Dictionary<string, string>>(body.ToString());

      // get the route id from the trips table
      string query = @$"
        SELECT DISTINCT route_id

        FROM stop_times 
          JOIN trips ON stop_times.trip_id=trips.trip_id
          
        WHERE stop_id = '{departure.Values.First()}';
      ";

      string route_id = "";

      using (SqlConnection sqlConnection = Configurations.CreateSqlConnection())
      {
        sqlConnection.Open();
        SqlCommand routeIdCommand = new SqlCommand(query, sqlConnection);

        using (SqlDataReader reader = routeIdCommand.ExecuteReader())
        {
          while(reader.Read())
          {
            route_id = reader.GetString(0);
            Console.WriteLine();

          }

        }

        string stopNamesQuery = $@"
          SELECT 
            DISTINCT stops.stop_id, stops.stop_name
          FROM stop_times 
            JOIN stops ON stop_times.stop_id = stops.stop_id

          WHERE trip_id LIKE '%{route_id}%';

        ";


        SqlCommand stopNamesCommand = new SqlCommand(stopNamesQuery, sqlConnection);
        using (SqlDataReader reader = stopNamesCommand.ExecuteReader())
        {
          while(reader.Read())
          {
            for(int i = 0; i < reader.FieldCount; i++)
            {
              var content = reader.GetString(i);

              Console.WriteLine();

            }
          }
        }

      };



      return "done";
    }


    [HttpPost("stoptimes")]
    public ActionResult<string> GetTimesToday([FromBody] object body)
    {
      Console.WriteLine(body);

      var stopIds = JsonConvert.DeserializeObject(body.ToString());

      Console.WriteLine();

      return "done";
    }

  }
}