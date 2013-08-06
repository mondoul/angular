using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Angular.Web.Data;
using Angular.Web.Models;

namespace Angular.Web.Controllers
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
            using (var context = new DropItDbContext())
            {
                var filesModel = context.SendModels.Include("Files").SingleOrDefault(m => m.Guid == id);
                if (filesModel == null) // not found
                    return RedirectToRoute("404");

                var model = new FilesReceivedModel
                    {
                        Files = new List<FileModel>(filesModel.Files ?? new List<FileModel>()),
                        Id = filesModel.Guid,
                        Name = filesModel.From
                    };
                return View("Files", model);
            }
        }

        public ActionResult Get(string filename, string id)
        {
            throw new System.NotImplementedException();
        }
    }
}
