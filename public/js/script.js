likeCheckedBox = document.getElementById("btn-check-outlined");
likedcount = document.getElementById("likec");
function checklike(){
	if (likeCheckedBox.checked == true){
		likedcount.innerHTML++;
	} else if(likeCheckedBox.checked == false){
		likedcount.innerHTML--;
	}
}
