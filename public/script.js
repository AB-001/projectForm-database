function typeChange() {

    var inputBox = document.getElementById('type');
    if (this.value==='checkbox')
    {
        inputBox.type='checkbox'
        console.log("checkbox")
    }
    else if(this.value==='radio')
    {
        inputBox.type='radio'
        console.log("radio")
    }
    else
    {
        inputBox.type='text'
        console.log("text")
    }
  }
  function save()
  {
    let quest=parseInt(localStorage.getItem("quest"))


    for(let i=0;i<quest;i++)
    {
        localStorage.setItem("quesT"+i,document.getElementsByName('type'+i)[0].value)
        localStorage.setItem('ques'+i,document.getElementsByName('ques'+i)[0].value)
        let opt=parseInt(localStorage.getItem("q"+i+"o"))

        for(let j=0;j<opt;j++)
        {
            localStorage.setItem("q"+i+"o"+j,document.getElementsByName("ques"+i+"opt"+j)[0].value)
        }
    }
  }
  function addOpt(qno,ono)
  {
    let opt=parseInt(localStorage.getItem("q"+qno+"o"))
    opt++
    localStorage.setItem('q'+qno+'o',opt)
    save()

  }
  function removeOpt(qno,ono)
  {
      let opt=parseInt(localStorage.getItem("q"+qno+"o"))
      opt--;
      //localStorage.setItem("kuch",'q'+qno+'o'+opt)
      localStorage.removeItem('q'+qno+'o'+opt);
      localStorage.setItem('q'+qno+'o',opt);
      save()
  }
function removeQues(qno)
{
    let quest=parseInt(localStorage.getItem("quest"))

    localStorage.removeItem("quesT"+qno)
    let opt=parseInt(localStorage.getItem("q"+qno+"o"))
    for(let j=0;j<opt;j++)
        localStorage.removeItem("q"+qno+"o"+j)
    for(let i=qno;i<quest;i++)
    {
            let k =i+1                   
            localStorage.setItem('ques'+i,document.getElementsByName('ques'+k)[0].value)
            opt=parseInt(localStorage.getItem("q"+k+"o"))
            for(let j=0;j<opt;j++)
                localStorage.setItem("q"+i+"o"+j,document.getElementsByName("ques"+k+"opt"+j)[0].value)
        
       
    }
    quest--
    localStorage.setItem("quest",quest)
    save()
}
function addQues()
{
    let quest=parseInt(localStorage.getItem("quest"));
    quest++;
    save();
    localStorage.setItem("quest",quest);
    quest--;
    localStorage.setItem("q"+quest+"o",1);
    save()

}
if (localStorage.getItem("quest") === null)
{
    localStorage.setItem("quest",1);
    localStorage.setItem("q0o",1);
}
  //typeChange();
let q=parseInt(localStorage.getItem("quest"));
for(let i=0;i<q;i++)
{
    document.getElementsByName('ques'+i)[0].value=localStorage.getItem("ques"+i);
    let opt = parseInt(localStorage.getItem("q"+i+"o"))
    for(let j=0;j<opt;j++)
    {
        document.getElementsByName("ques"+i+"opt"+j)[0].value=localStorage.getItem("q"+i+"o"+j)
    }
}
  document.getElementById('option_type').addEventListener('change', typeChange);
