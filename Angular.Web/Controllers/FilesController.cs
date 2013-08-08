﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Angular.Web.Data;
using Angular.Web.Models;
using Newtonsoft.Json;

namespace Angular.Web.Controllers
{
    public class FilesController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage Files(string id)
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
                    var sendModel = context.SendModels.Add(new SendModel
                    {
                        Guid = model.Guid,
                        From = model.From,
                        To = model.To,
                        Message = model.Message
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
                    context.SaveChanges();
                }
                //TODO: id / id shortened
                //TODO: envoyer le mail

                var content = string.Format("{0}://{1}{2}",
                                            Request.RequestUri.Scheme,
                                            Request.RequestUri.Authority,
                                            Url.Route("ListFiles", new {id = model.Guid}));
                
                return Request.CreateResponse(HttpStatusCode.OK, content);
            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, e.ToString());
            }
        }
    }
}
