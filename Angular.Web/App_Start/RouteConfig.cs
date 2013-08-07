using System.Web.Mvc;
using System.Web.Routing;
using Microsoft.AspNet.SignalR;

namespace Angular.Web
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapHubs(new HubConfiguration{EnableJavaScriptProxies = false});

            routes.MapRoute(
                "404",
                "404",
                new { controller = "Home", action = "HttpStatus404" });

            routes.MapRoute(
                "ListFiles",
                "{id}",
                new { controller = "Home", action = "Files"});

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}