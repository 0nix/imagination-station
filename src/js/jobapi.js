let is = is || {};
is.jobapi = {};
is.jobapi.list = (offset,limit,callback) => {
  $.ajax({
    method: "GET",
    url: "/api/job/listowner?offset="+offset+"&limit="+limit,
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.jobapi.listScore = (offset,limit,callback) => {
  $.ajax({
    method: "GET",
    url: "/api/job/listscore?offset="+offset+"&limit="+limit,
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.jobapi.search = (words,offset,limit,callback) => {
 $.ajax({
    method: "PUT",
    url: "/api/job/search?offset="+offset+"&limit="+limit,
    data: JSON.stringify({
      keywords: words
    }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  }); 
}
is.jobapi.create = (meta,callback) => {
  $.ajax({
    method: "POST",
    url: "/api/job",
    data: JSON.stringify(meta), 
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
};
is.jobapi.get = (id,callback)=> {
  $.ajax({
    method:"GET",
    url:"/api/job/"+id,
    success: (data) => {
      if(callback) callback(null,data)
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.jobapi.put = (id,meta,callback) => {
  $.ajax({
    method: "PUT",
    url: "/api/job/"+ id,
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
is.jobapi.delete = (id,callback) => {
  $.ajax({
    method: "DELETE",
    url: "/api/job/"+id,
    success: (data) => {
      if(callback) callback(null,data)
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
};
is.jobapi.test = () => {
  is.jobapi.create({"title": "Test Job", "c": "Test Content", "vac": "true", "keywords":["baby","cookie"]}, (err, data) => {
    console.log(data)
    if(err) return console.log(err);
    is.jobapi.get(data.id,(err,_data) => {
      if(err) return console.log(err);
      console.log(_data);
      is.jobapi.put(data.id,{"title": "Modified Job", "c": "Modified Content", "vac": "true", "keywords":["baby","street"]}, (err,__data) => {
        if(err) return console.log(err);
        is.jobapi.delete(data.id,(err,___data) => {
          if(err) return console.log(err);
          console.log(data);
        })
      });
    });
  })
}