const express = require('express')
const bodyParser= require('body-parser')
const mongoose= require('mongoose');
const _=require("lodash")
main().catch(err => console.log(err))
const app= express();
// const date= require(__dirname+ "/date.js")
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
async function main(){
    await mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true})
    const itemSchema= new mongoose.Schema({
        name: String
    })
    const Item = mongoose.model("Item",itemSchema);

    // await Item.deleteOne({name: "Udemy Course"})
const listSchema = {
    name: String,
    items: [itemSchema]
}
const List = mongoose.model("List", listSchema)
const defaultList= [{name: "Udemy Course"},
{name: "Machine Learning"},
{name: "Patent"}]

app.get("/",async function(req,res){
    // const day=date.getDate();
    const foundItems= await Item.find()
    if(foundItems.length===0){
        await Item.create(defaultList)
        res.redirect("/")
        }
        else{
            res.render("list", {listTitle: "Today", newListItem: foundItems});
        }

})

app.post("/delete", async function(req,res){
    const checkedItem= req.body.checkedBox
    const listName= req.body.listName;
    
    if(listName==="Today"){
        await Item.findByIdAndRemove(checkedItem).then(res.redirect("/"));
    }
    else{
        await List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItem}}})
        res.redirect("/"+ listName)
    }
    // await Item.deleteOne({_id: checkedItem})

})
app.post("/", async function(req,res){
    let kindOfTitle= req.body.submitButton;
    var itemAdded= req.body.nextItem;
    // if(kindOfTitle==="Work"){
    //     work.push(itemAdded);
    //     res.redirect("/work")
    // }
    // else{
    // foundItems.push(itemAdded);
    // res.redirect("/")
    // }
    const newItem= await Item({
        name: itemAdded
    })
    if(kindOfTitle === "Today"){
        newItem.save()
        res.redirect("/")
    }
    else{
        const foundListTwo = await List.findOne({name: kindOfTitle})
            foundListTwo.items.push(newItem)
            foundListTwo.save();
            res.redirect("/"+kindOfTitle)
    }
})
app.get("/:text",async function(req,res){
    const pageName= _.capitalize(req.params.text)

    const foundList= await List.findOne({name: pageName})
    if(foundList){
        res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
    }
    else{
        const list= new List({
            name: pageName,
            items: defaultList
        })
        list.save();
        res.render("list", {listTitle: list.name, newListItem: list.items});
    }
    })


app.listen(3000, function(){
    console.log("Server initiated");
})
}
