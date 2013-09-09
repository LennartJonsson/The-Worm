<?php $title='HTML5 Canvas animation playing the game "The-Worm"'; include(__DIR__ . '/template/header.php'); ?>
    <div id='flash'>
      <h1>Control the Worm using key arrows or AD</h1>
      <h2 id='eaten'></h2>
      <h2 id='alltimehigh'></h2>
      <h2 id='tail'></h2>
      <br/>
      <canvas id='canvas1' width='900' height='512'>
	Your browser does not support the HTML5 element canvas.
      </canvas>
      <input type='button' id='start' value='Start game'>
    </div>
<?php $path=__DIR__; include(__DIR__ . '/template/footer.php'); ?>

