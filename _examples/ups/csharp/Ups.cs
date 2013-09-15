using System;
using System.Collections.Generic;
using System.Net;
using System.IO;
using Microsoft.CSharp;
using Newtonsoft.Json;

namespace UPSScrapey
{
	class MainClass
	{
		// Please note that you'll need Json.Net
		// http://james.newtonking.com/pages/json-net.aspx
		static void Main (string[] args)
		{
			// Scrapey URL
			const string SCRAPEY = "http://localhost:8100/c/ups-blog/";
			// Initial page to start scraping
			var q = new Queue<string> ();
			q.Enqueue ("http://blog.ups.com/");

			// Max number of results pages to scrape
			var maxResultsPages = 5;

			// Please note that this code scrapes one page at a time
			while (q.Count > 0) {
				// Make a request to scrapey
				var url = SCRAPEY + "?url=" + Uri.EscapeUriString(q.Dequeue ());
				var res = HttpWebRequest.Create (new Uri (url)).GetResponse();
				var bodyStr = new StreamReader (res.GetResponseStream ()).ReadToEnd ();
				// The result is JSON, so parse this
				dynamic body = JsonConvert.DeserializeObject(bodyStr);

				// Depending on what kind of page we have
				switch (res.Headers.Get ("Scrapey-Handler")) {
				case "ups-result":
					// We either add more pages to the queue (detail links and previous page)
					if (--maxResultsPages > 0)
						q.Enqueue (body["previousPage"].Value);
					foreach (var p in body.posts)
						q.Enqueue (p["link"].Value);
					break;
				case "ups-detail":
					// On the detail page we can now consume the data we got
					Console.WriteLine (body.title + " (" + body.author + ") has " + body ["comments"].Count + " comments");
					break;
				}
			}
		}
	}
}
