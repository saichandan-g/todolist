//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const date = require(__dirname + "/date.js");
mongoose.connect('mongodb+srv://saichandang:chandan24@cluster0.jtfjiig.mongodb.net/todolistDB',{useNewUrlParser:true})
const app = express();
const itemsSchema =new mongoose.Schema({
   name:{
    type:String,
    required:[true,"pleace check ur data entry"]
}
})
const Item = mongoose.model("Item",itemsSchema )
const item1 = new Item({
  name:"Welcome to your todolist"
})
const item2 = new Item({
  name:"Hit the + button to add a new item"
})
const item3 = new Item({
  name:"<--Hit this to delate an item"
})
const defaultItems=[item1,item2,item3]

const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema)
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", async function(req, res) {
  const day = date.getDate();
  const items= await Item.find()
  if(items.length===0){
  Item.insertMany(defaultItems)
  .then(function(){
    console.log("successfully saved to database")
  })
  .catch(function(err){
    console.error(err)
  })
    res.redirect("/")
    }

  else{
    res.render("list", {listTitle: day, newListItems: items});

  }
 
});

app.post("/", function(req, res){

  const itemName=  req.body.newItem;
  listName = req.body.list;  
  if (listName) {     listName = listName.trim();   }
  const item = new Item({
    name: itemName
  })
  if(listName==="Today")
  {
  item.save()
  res.redirect("/")}
  else{
    List.findOne({name:listName}).then(function (foundList) {
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
  })
}

});
app.post("/delete", async function(req, res){
  checkedItemId = req.body.checkbox;
  const listName =req.body.listName
  if (listName==="Today")
  {
    console.log(checkedItemId);
    if(checkedItemId != undefined){
        await Item.findByIdAndRemove(checkedItemId)
        .then(()=>console.log(`Deleted ${checkedItemId} Successfully`))
        .catch((err) => console.log("Deletion Error: " + err));
        res.redirect("/");
    }
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
    {
      res.redirect("/" + listName);
    })

  } 
})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName)
 
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
