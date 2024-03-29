let mongoose=require('mongoose');

let ShowSchema=new mongoose.Schema({
        title: {
            type:String,
            required:true
        },
        season: {
            type:Number,
            required:true
        },
        released: {
            type:String,
            required:true
        },
        cost: {
            type:Number,
            required:true
        },
        stock: {
            type:Number,
            required:true
        }
    },
    {collection:'Shows'});

module.exports=mongoose.model('Shows', ShowSchema);


/*const shows = [
    {id:200001, title:'House', season:'1', released:'2004', cost:24.50, stock:1530},
    {id:200002, title:'House', season:'2', released:'2005', cost:21.00, stock:1900},
    {id:200003, title:'House', season:'3', released:'2006', cost:17.50, stock:1290},
    {id:200004, title:'House', season:'4', released:'2007', cost:13.99, stock:1700},
    {id:200005, title:'House', season:'5', released:'2008', cost:20.00, stock:3030},
    {id:200006, title:'House', season:'6', released:'2009', cost:15.30, stock:5700},
    {id:200007, title:'House', season:'7', released:'2010', cost:28.00, stock:6900},
    {id:200008, title:'House', season:'8', released:'2011', cost:30.00, stock:8930},
    {id:200009, title:'The Good Doctor', season:'1', released:'2017', cost:19.00, stock:4223},
    {id:200010, title:'The Good Doctor', season:'2', released:'2018', cost:22.00, stock:5500},
    {id:200011, title:'The Good Doctor', season:'3', released:'2019', cost:31.00, stock:6000},
    {id:200012, title:'Chernobyl', season:'1', released:'2019', cost:35.00, stock:2600},
    {id:200013, title:'The boys', season:'1', released:'2019', cost:20.00, stock:11000}

];

module.exports = shows;*/