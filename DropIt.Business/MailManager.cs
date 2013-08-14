using System.Net;
using System.Net.Mail;
using DropIt.Business.Domain;
using RazorEngine;
using SendGrid;
using SendGrid.Transport;

namespace DropIt.Business
{
    public class MailManager
    {

        private const string ShareSubject = "{0} shared some files with you";
        private const string DownloadComplete = "Download complete !";
        private const string From = "no-reply@dropit.com";
        private const string MailUser = "azure_f1b6333c91dac18912166f7230b1bc9b@azure.com";
        private const string MailPwd = "ez9dtrgg";


        public void SendShareMail(SendModel model, string link)
        {
            var myMessage = Mail.GetInstance();
            myMessage.From = new MailAddress(From);
            myMessage.ReplyTo = new[]{ new MailAddress(model.To) };
            myMessage.AddTo(model.To);
            myMessage.Subject = string.Format(ShareSubject, model.From);

            var template = Properties.Resources.Share;
            myMessage.Html = Razor.Parse(template, new { model.From, link, model.Message }.ToExpando());

            SendMail(myMessage);
        }

        public void SendDownloadedFilesMail(SendModel model)
        {
            var myMessage = Mail.GetInstance();
            myMessage.From = new MailAddress(From);
            myMessage.AddTo(model.From);
            myMessage.Subject = DownloadComplete;

            var template = Properties.Resources.DownloadComplete;
            myMessage.Html = Razor.Parse(template, new { Name = model.To }.ToExpando());
            
            SendMail(myMessage);
        }

        private void SendMail(Mail mail)
        {
            var credentials = new NetworkCredential(MailUser, MailPwd);
            var transportSmtp = SMTP.GetInstance(credentials);
            transportSmtp.Deliver(mail);
        }
    }
}
