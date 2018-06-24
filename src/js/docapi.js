let is = is || {};
is.docapi = {};
is.docapi.list = (offset,limit,callback) => {
  $.ajax({
    method: "GET",
    url: "/api/doc/list?offset="+offset+"&limit="+limit,
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.docapi.create = (callback) => {
  $.ajax({
    method: "POST",
    url: "/api/doc",
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
};
is.docapi.get = (id,callback)=> {
  $.ajax({
    method:"GET",
    url:"/api/doc/"+id,
    success: (data) => {
      if(callback) callback(null,data)
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.docapi.putMeta = (id,meta,callback) => {
  $.ajax({
    method: "PUT",
    url: "/api/doc/"+ id,
    data: JSON.stringify(meta), 
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => {
      if(callback) callback(null,data)
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
};
is.docapi.putCt = (id,content,callback) => {
  $.ajax({
    method: "PUT",
    url: "/api/edit/"+id,
    data: JSON.stringify({
      ct: content
    }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => {
      if(callback) callback(null,data)
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
};
is.docapi.delete = (id,callback) => {
  $.ajax({
    method: "DELETE",
    url: "/api/doc/"+id,
    success: (data) => {
      if(callback) callback(null,data)
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
};
is.docapi.test = () => {
  $.ajax({
    method: "POST",
    url: "/api/doc",
    success: (data) => {
      console.log("POST DONE",data);
      $.ajax({
        method:"GET",
        url:"/api/doc/"+data,
        success: (data) => {
          var ii = data.id
          console.log("GETTING DONE",ii)
          $.ajax({
            method: "PUT",
            url: "/api/doc/"+ ii,
            data: JSON.stringify({
              title:"Testing the API"
            }), 
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (data) => {
              console.log("PUTTING METADATA DONE",data);
              $.ajax({
                method: "PUT",
                url: "/api/edit/"+ii,
                data: JSON.stringify({
                  ct:"Testing the API for CONTENTS"
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (data) => {
                  console.log("PUTTING CONTENT DONE",data);
                  $.ajax({
                    method: "DELETE",
                    url: "/api/doc/"+ii,
                    success: (data) => {
                      console.log("DELETING DOCUMENT DONE",data);
                    },
                    error:(xhr,status,error) => {
                      console.log(xhr,status,error)
                    }
                  });
                },
                error:(xhr,status,error) => {
                  console.log(xhr,status,error)
                }
              });
            },
            error:(xhr,status,error) => {
              console.log(xhr,status,error)
            }
          });
        },
        error:(xhr,status,error) => {
          console.log(xhr,status,error)
        }
      });
    },
    error:(xhr,status,error) => {
          console.log(xhr,status,error)
    }
  });
};