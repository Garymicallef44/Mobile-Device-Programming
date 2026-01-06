
export const sendNotif = async (id:string,title:string,message:string)=>{
  try{
    const response = await fetch("http://10.0.2.2:3000/send-notif",{
      method:"POST",
      headers:{"Content-Type": "application/json"},
      body: JSON.stringify({
        id:id,
        title:title,
        msg:message,
        
      }),
    });
    console.log(response);
    const data= await response.json();
  }catch(err){
    console.error("Error sending notification:",err);
  }
};


