using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Data.SqlClient;

namespace MetraApi.Models
{
  public class Configurations
  {
    public static HttpClient CreateHttpConnection(HttpClient client)
    {
      string access = System.Configuration.ConfigurationManager.AppSettings["accessKey"];
      string secret = System.Configuration.ConfigurationManager.AppSettings["secretKey"];

      string auth = "Basic " + Convert.ToBase64String(Encoding.Default.GetBytes($"{access}:{secret}"));
      client.DefaultRequestHeaders.Add("Authorization", auth);

      return client;

    }

    public static SqlConnection CreateSqlConnection()
    {
      return new SqlConnection()
      {
        ConnectionString = System.Configuration.ConfigurationManager.AppSettings["db_string"]
      };
    }
  }

  public class MetraStop
  {
    
    public string stop_id {get;set;}
    public string stop_name {get;set;}
    public string stop_desc {get;set;}
    public string stop_lat {get;set;}
    public string stop_lon {get;set;}
    public string zone_id {get;set;}
    public string stop_url {get;set;}
    public string wheelchair_boarding {get;set;}
  }

  public class MetraTrip
  {
   
    public string route_id {get;set;}
    public string service_id {get;set;}
    public string trip_id {get;set;}
    public string trip_headsign {get;set;}
    public string block_id {get;set;}
    public string shape_id {get;set;}
    public int direction_id {get;set;}

  }


}
