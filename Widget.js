define([
  'dojo/_base/declare', 
  'jimu/BaseWidget',
  "dojo/store/Memory", 
  "dijit/form/FilteringSelect",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "dojo/on",
  "dojo/_base/lang"
],
function(
  declare, 
  BaseWidget,
  Memory,
  FilteringSelect,
  Query,
  QueryTask,
  on,
  lang
  ) {
  return declare([BaseWidget], {

    baseClass: 'combo-box',

    postCreate: function() {
      this.inherited(arguments);

      this.own(on(this.stateSelect,"click", lang.hitch(this, function(evt){
        evt.preventDefault()
          console.log(this.stateSelect.value)
          this._localizarQuadra(evt.target.value)
        }
      )));

      locNames = []
      
      var queryTask = new QueryTask(this.config.serviceFeatureBase);
      var query = new Query();
      query.where = "1=1"
      query.returnGeometry = true;
      queryTask.execute(query, function (results) {
        results.features.forEach(function(res) { 
          locNames.push(res.attributes);    
        })
    })

    var stateStore = new Memory({ data: locNames });
    console.log(stateStore)

    var filteringSelect = new FilteringSelect({
      id: "stateSelect",
      store: stateStore,
      searchAttr: "gtm_cod_quadrafiscal"
    });
    this.stateSelect.appendChild(filteringSelect.domNode)
    },

    _localizarQuadra: function (codQuadrafiscal) {
      var queryTask = new QueryTask(this.config.serviceFeatureBase);
      var query = new Query();
      query.where = this.config.fieldBase + `= '${codQuadrafiscal}'`;
      query.returnGeometry = true;
      queryTask.execute(query, lang.hitch(this, function (resp) {
        let geoR = resp.features[0].geometry
        console.log(geoR, 'Rings')
        this._returnLotes(geoR);
      }));
    },

    _returnLotes: function (geoR)  {
      var tabela = this.tabela
      var queryTask = new QueryTask(this.config.serviceFeatureSelection);
      var query = new Query();
      query.geometry = geoR;
      query.outSpatialReference = {wkid:31982};
      queryTask.execute(query, lang.hitch(this, function (resp) {
        console.log(resp.features, 'Lotes')
        resp.features.forEach(element => {
          let line = this.createLine(element);
          tabela.appendChild(line);
        });
      }));
    },

    createLine: function(data){
      console.log(data)
      line = document.createElement("tr");
      tdId = document.createElement("td");
      tdNome = document.createElement("td");
      tdId.innerHTML = JSON.stringify(data)
  
      line.appendChild(tdId);
      return line;
    },

  });

});
