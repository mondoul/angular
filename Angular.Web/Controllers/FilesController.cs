using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DropIt.Business;
using DropIt.Business.Data;
using DropIt.Business.Domain;
using DropIt.Web.Models;

namespace DropIt.Web.Controllers
{
    public class FilesController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage Get(string id)
        {
            using (var context = new DropItDbContext())
            {
                var filesModel = context.SendModels.Include("Files").SingleOrDefault(m => m.Guid == id);
                if (filesModel == null) // not found
                    return Request.CreateResponse(HttpStatusCode.NotFound);

                var model = new FilesReceivedModel
                {
                    Files = new List<FileModel>(filesModel.Files ?? new List<FileModel>()),
                    Name = filesModel.From
                };
                return Request.CreateResponse(HttpStatusCode.OK, model);
            }
        }

        [HttpPost]
        public HttpResponseMessage Share(SendModel model)
        {
            try
            {
                using (var context = new DropItDbContext())
                {
                    var existingModel = context.SendModels.SingleOrDefault(m => m.Guid == model.Guid);
                    if (existingModel != null)
                    {
                        existingModel.From = model.From;
                        existingModel.To = model.To;
                        existingModel.Message = model.Message;
                    }
                    else
                    {
                        var sendModel = context.SendModels.Add(new SendModel
                            {
                                Guid = model.Guid,
                                From = model.From,
                                To = model.To,
                                Message = model.Message,
                                NotifyWhenDownloadComplete = model.NotifyWhenDownloadComplete
                            });
                        foreach (var file in model.Files)
                        {
                            context.FileModels.Add(new FileModel
                                {
                                    Name = file.Name,
                                    Size = file.Size,
                                    SendModelId = sendModel.Guid
                                });
                        }
                    }
                    context.SaveChanges();
                }
                //TODO: id / id shortened
                var content = string.Format("{0}://{1}{2}",
                                            Request.RequestUri.Scheme,
                                            Request.RequestUri.Authority,
                                            Url.Route("ListFiles", new { id = model.Guid }));

                var mailManager = new MailManager();
                mailManager.SendShareMail(model, content);
                
                return Request.CreateResponse(HttpStatusCode.OK, content);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, e.ToString());
            }
        }

        [HttpPost]
        public HttpResponseMessage Remove(FileModel fileinfo)
        {
            using (var context = new DropItDbContext())
            {
                var file = context.FileModels.SingleOrDefault(f => f.SendModelId == fileinfo.SendModelId && f.Name == fileinfo.Name);
                if (file == null) // not found
                    return Request.CreateResponse(HttpStatusCode.NotFound);

                context.FileModels.Remove(file);
                context.SaveChanges();
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
