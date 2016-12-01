jQuery(document).ready(function($){
	$('.case_popup .close').click(function(){
		$('.case_popup').hide();
	});

	$('.case_popup .bg').click(function(){
		$('.case_popup').hide();
	});


	// 공모전 어워드 팝업
	$('.event_popuop .close').click(function(){
		$(this).parents('.event_popuop').hide();
	});

});

function open_poll_award_popup(no){
	var poll_popup = document.getElementById('poll'+no+'_award_popup');
	poll_popup.style.display = 'block';
}