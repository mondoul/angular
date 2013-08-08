﻿using System;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Mvc;
using Angular.Web.Data;
using Angular.Web.Models;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.RetryPolicies;

namespace Angular.Web.Controllers
{
    public class UploadController : Controller
    {
        [HttpPost]
        public ActionResult SetMetadata(int blocksCount, string fileName, long fileSize, int fileIndex, string id)
        {
            var container = GetContainer();

            container.CreateIfNotExists();
            var fileToUpload = new CloudFile()
            {
                BlockCount = blocksCount,
                FileName = fileName,
                Size = fileSize,
                BlockBlob = container.GetBlockBlobReference(fileName),
                StartTime = DateTime.Now,
                IsUploadCompleted = false,
                UploadStatusMessage = string.Empty,
                FileKey = "CurrentFile" + fileIndex.ToString(),
                FileIndex = fileIndex
            };
            Session.Add(fileToUpload.FileKey, fileToUpload);
            return Json(new { success = true, index = fileIndex });
        }

        [HttpPost]
        public ActionResult Complete(FileModel file)
        {
            using (var context = new DropItDbContext())
            {
                var fileModel = context.FileModels.SingleOrDefault(f => f.SendModelId == file.SendModelId
                                                                    && f.Name == file.Name);
                if (fileModel == null)
                    return RedirectToRoute("404");
                fileModel.IsUploaded = true;
                context.SaveChanges();
            }
            return Content("OK");
        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult UploadChunk(int id, int fileIndex, string shareId)
        {
            var request = Request.Files["Slice"];
            var chunk = new byte[request.ContentLength];
            request.InputStream.Read(chunk, 0, Convert.ToInt32(request.ContentLength));
            JsonResult returnData;
            var fileSession = "CurrentFile" + fileIndex;
            if (Session[fileSession] != null)
            {
                var model = (CloudFile)Session[fileSession];
                returnData = UploadCurrentChunk(model, chunk, id);
                if (returnData != null)
                {
                    return returnData;
                }
                if (id == model.BlockCount)
                {
                    return CommitAllChunks(model);
                }
            }
            else
            {
                returnData = Json(new
                {
                    error = true,
                    isLastBlock = false,
                    message = "Echec de l'upload du fichier."
                });
                return returnData;
            }

            return Json(new { error = false, isLastBlock = false, message = string.Empty, index = fileIndex });
        }

        private ActionResult CommitAllChunks(CloudFile model)
        {
            model.IsUploadCompleted = true;
            var errorInOperation = false;
            try
            {
                var blockList =
                    Enumerable.Range(1, (int)model.BlockCount)
                              .ToList()
                              .ConvertAll(rangeElement => Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Format(CultureInfo.InvariantCulture, "{0:D4}", rangeElement))));
                model.BlockBlob.PutBlockList(blockList);
                var duration = DateTime.Now - model.StartTime;
                float fileSizeInKb = model.Size / 1024;
                var fileSizeMessage = fileSizeInKb > 1024
                                        ? string.Concat((fileSizeInKb / 1024).ToString("f2", CultureInfo.CurrentCulture), " MB")
                                        : string.Concat(fileSizeInKb.ToString("f2", CultureInfo.CurrentCulture), " KB");
                model.UploadStatusMessage = string.Format(CultureInfo.CurrentCulture, "{0}", fileSizeMessage);
            }
            catch (StorageException e)
            {
                model.UploadStatusMessage = "Echec d'upload du fichier. Exception - " + e.Message;
                errorInOperation = true;
            }
            finally
            {
                Session.Remove(model.FileKey);
            }
            return Json(new {
                            error = errorInOperation,
                            isLastBlock = model.IsUploadCompleted,
                            message = model.UploadStatusMessage,
                            index = model.FileIndex
                        });
        }

        private JsonResult UploadCurrentChunk(CloudFile model, byte[] chunk, int id)
        {
            using (var chunkStream = new MemoryStream(chunk))
            {
                var blockId = Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Format(CultureInfo.InvariantCulture, "{0:D4}", id)));
                try
                {
                    model.BlockBlob.PutBlock(
                        blockId,
                        chunkStream, null, null,
                        new BlobRequestOptions()
                        {
                            RetryPolicy = new LinearRetry(TimeSpan.FromSeconds(10), 3)
                        });
                    return null;
                }
                catch (StorageException e)
                {
                    Session.Remove(model.FileKey);
                    model.IsUploadCompleted = true;
                    model.UploadStatusMessage = "Echec d'upload du fichier. Exception - " + e.Message;
                    return Json(new { error = true, isLastBlock = false, message = model.UploadStatusMessage, index = model.FileIndex });
                }
            }
        }

        private byte[] GetBlob(string fileName)
        {
            var container = GetContainer();
            var blockBlob = container.GetBlockBlobReference(fileName);

            using (var memStream = new MemoryStream())
            {
                blockBlob.DownloadToStream(memStream);
                return memStream.ToArray();
            }
        }

        public JsonResult RemoveBlob(string fileName)
        {
            var container = GetContainer();
            var blockBlob = container.GetBlockBlobReference(fileName);
            blockBlob.DeleteIfExists();
            return Json(new { success = true });
        }

        private CloudBlobContainer GetContainer()
        {
            return CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["Storage"].ConnectionString)
                                               .CreateCloudBlobClient()
                                               .GetContainerReference(ConfigurationManager.AppSettings["CloudStorageContainerReference"]);
        }
    }
}
