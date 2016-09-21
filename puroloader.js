var CouchProxy = {
	getAllModels: function(callback) {
		$.get(couchProxyUrl+"?do=getall", "", callback, "json");
	},
	getModel: function(modelId, callback) {
		$.get(couchProxyUrl+"?do=getdoc&docId="+modelId, "", callback, "json");		
	},
	saveModel: function(modelId, model, callback) {
		//$.post(couchProxyUrl+"?do=savedoc&docId="+modelId, JSON.stringify(model), callback, "json");		
		
		$.ajax(couchProxyUrl+"?do=savedoc&docId="+modelId, {
		    data : JSON.stringify(model),
		    contentType : 'application/json',
		    type : 'POST',
		    success: callback
		});
	},
	addModel: function(model, callback) {
		//$.post(couchProxyUrl+"?do=adddoc", JSON.stringify(model), callback, "json");		
		
		$.ajax(couchProxyUrl+"?do=adddoc", {
		    data : JSON.stringify(model),
		    contentType : 'application/json',
		    type : 'POST',
		    success: callback
		});
	}
};

function PuroLoader() {
	//dojo.require("dojox.json.ref");
	//var thisloader = this;
	//require(["dojo/store/JsonRest"], function(JsonRest){
	//	  	thisloader.store = new JsonRest({ target: couchdbUrl });});
	this.saveAttempts = 0;
};

/*
PuroLoader.prototype.addModel = function(model) {
	//this.store.newItem(model, null);
	//this.store.save(null);
	this.store.add(model, {id:model.id});
};*/

PuroLoader.prototype.resetAttemptCounter = function() {
	this.saveAttempts = 0;
};

PuroLoader.prototype.saveModel = function(model) {
	/*store = this.store;
	model.modified = Date.now();
	this.saveAttempts++;
	if(this.saveAttempts>50) {
		alert('Unable to save the model. Giving up.');
		return 0;
	}
	var retry = this.saveModel.bind(this);
	var success = this.resetAttemptCounter.bind(this);
	if(model.oldId != null) {
		//this.store.remove(model.oldId+"?rev="+model.oldRev).then(function() {
		//	store.add(model, null);
		//});
		model._rev = model.oldRev;
		store.put(model, {id:model.oldId}).then(
			function(result){
				model.oldRev=result.rev;
				success();
			}, function() {retry(model);});
	}
	else this.store.add(model, null).then(
			function(result){
				model.oldRev=result.rev;
				model.oldId=result.id;
				success();
			}, function() {retry(model);});*/
	this.model = model;
	model.modified = Date.now();
	var saveCallback = this.saveRevisionId.bind(this);
	if(model.inStore) {
		CouchProxy.saveModel(model.oldId, model, saveCallback);
	}
	else CouchProxy.addModel(model, saveCallback);
};

PuroLoader.prototype.saveRevisionId = function(result){
	var resultObj = JSON.parse(result);
	this.model._rev = resultObj.rev;
	this.model.inStore = true;
	this.model.oldId = resultObj.id;
}

PuroLoader.prototype.getRandomInt = function(){
	max = 100000000;
	min = 10;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
PuroLoader.prototype.getNewId = function(){
	found = false;
	while(!found)
	{
		id = this.getRandomInt();
		//obj = this.store.fetchItemByIdentity({identity:id});
		obj = null;
		obj = this.store.get(id);
		if(obj==null) found = true;
	}
	return id;
};*/

PuroLoader.prototype.deserialize = function(obm) {
	return dojox.json.ref.resolveJson(obm);
};

PuroLoader.prototype.getOBMs = function(puroview, url, user) {
	//var result = this.store.fetch({sort: [{attribute: "name"}]}).results; //{sort: [{attribute: "name"}]}
	
	/*
	var puroloader = this;
	this.store.target = url;
	this.store.query("_all_docs?include_docs=true", null ).then(function(result){
		obms = [];
		for(var i=0; i<result.rows.length; i++){
			var obm = puroloader.deserialize(result.rows[i].doc);
			if(obm.author == user || user == "admin") obms.push(obm);
		}
		puroview.fillOBMList(obms);
	});*/

	var puroloader = this;
	CouchProxy.getAllModels(function(result){
		//deserializedResult = JSON.parse(result);
		obms = [];
		for(var i=0; i<result.rows.length; i++){
			//var obm = puroloader.deserialize(result.rows[i].doc);
			var obm = result.rows[i].doc;
			if(obm.author == user || user == "admin") obms.push(obm);
		}
		puroview.fillOBMList(obms);
	});	
};

PuroLoader.prototype.getOBMbyId = function(id, controller) {
	/*
	this.store.get(id).then(function(obm){
		desOBM = dojox.json.ref.resolveJson(obm);
		rebuiltModel = new PuroModel();
		rebuiltModel.rebuildFrom(desOBM);
		controller.loadModelFromJStore(rebuiltModel);
	});*/
	
	CouchProxy.getModel(id, function(obm){
		//desOBM = JSON.parse(obm);
		rebuiltModel = new PuroModel();
		rebuiltModel.rebuildFrom(obm);
		rebuiltModel.inStore =true;
		rebuiltModel.oldId = obm._id;
		rebuiltModel._rev = obm._rev;
		controller.loadModelFromJStore(rebuiltModel);
	});
	
};
