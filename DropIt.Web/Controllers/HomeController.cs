using System.Web.Mvc;

namespace DropIt.Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        //404
        public ActionResult HttpStatus404()
        {
            return View("Hello");
        }

        public ActionResult Files(string id)
        {
            return View("Files", model:id);
        }
    }
}
