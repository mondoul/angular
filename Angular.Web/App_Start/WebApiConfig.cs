using System.Web.Http;

namespace Angular.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            config.Formatters.XmlFormatter.SupportedMediaTypes.Clear();
            //var container = (AutofacWebApiDependencyResolver)GlobalConfiguration.Configuration.DependencyResolver;

        }
    }
}
