let is = is || {};
is.revapi = {};
is.revapi.force = (id,callback) => {
  $.ajax({
    method: "POST",
    url: "/api/force/"+id,
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.revapi.list = (id,callback) => {
    $.ajax({
    method: "GET",
    url: "/api/rev/list/"+id,
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.revapi.getRev = (id,revIndex,callback) => {
    $.ajax({
    method: "GET",
    url: "/api/rev/"+id+"/"+revIndex,
    success: (data) => {
      if(callback) callback(null,data);
    },
    error:(xhr,status,error) => {
      console.log(xhr,status,error);
      if(callback) callback(xhr);
    }
  });
}
is.revapi.docFromRev = (id,revIndex,meta,callback) => {
   $.ajax({
    method: "POST",
    url: "/api/rev/branch/"+id+"/"+revIndex,
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
}