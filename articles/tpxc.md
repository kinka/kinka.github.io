# txpc patch

```
var oldMakeAnse = MakeAnse;
MakeAnse = function(Q) {
	oldMakeAnse(Q);
	var obj=window.document.getElementById("Vi_answe"+(CurrentID));
	obj.innerText= CaoTi_answer[CurrentID-1];  
	if(CaoTi_answer[CurrentID-1]!=CaoTi_Myanswer[CurrentID-1]) {
     obj.style.color="Blue"
     obj.parentElement.style.background="peachpuff"
     }
   else{ 
        obj.style.color="Green" 
        obj.parentElement.style.background=""}  
  }
```