USE [MetraSchedules]
GO
/****** Object:  StoredProcedure [dbo].[GetTimesToday]    Script Date: 04/09/2020 14:00:06 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[GetTimesToday] @departure nvarchar(50)
AS

	
SELECT	stop_times.stop_id,
		stop_times.trip_id,
		arrival_time, 
		stop_name,
		stop_lat, stop_lon,
		zone_id,
		trips.service_id,
		stop_sequence,

		monday, tuesday, wednesday, thursday, friday, saturday, sunday,

		LAG(stop_sequence,1) OVER (
			ORDER BY trips.trip_id
		)

	FROM stop_times
		INNER JOIN stops	ON stop_times.stop_id	= stops.stop_id
		INNER JOIN trips	ON stop_times.trip_id	= trips.trip_id
		INNER JOIN calendar ON trips.service_id		= calendar.service_id

	WHERE stop_times.stop_id = @departure
	ORDER BY arrival_time ASC;
