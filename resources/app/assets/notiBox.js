const notification = document.getElementById("notiBox-container")

module.exports.showNotification = function(arg) {
    var arguments = arg.split(',');
    //console.log("Made it to notiBox")
    const content = `
    <div id="alert">
      <label class="alert-container">
        <div class="alert-content">
          <!--put content here-->
          <div id="alert-heading">${ arguments[0] }</div>
          <div>
            <p>${ arguments[1] }</p>
          </div>
          <!--/put content here-->
        </div>
        <svg width="24" height="24" role="button" class="alert-close" id="testCloseAlert">
          <line x1="0" x2="24" y1="0" y2="24" stroke="black" stroke-width="5" />
          <line x1="24" x2="0" y1="0" y2="24" stroke="black" stroke-width="5" />
        </svg>
      </label>
      
    </div>
    `
    $('#notiBox-container').html(content);
    $('#notiBox-container').show();
}


$('body').on('click', '#testCloseAlert', function(){
    $('#notiBox-container').html('');
});