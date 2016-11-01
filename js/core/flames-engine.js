/*

	Os dados em uma determinada imagem variam de 4 em 4, sendo:

	0 - R
	1 - G
	2 - B
	3 - Alpha
	
	Melhorias X Performance ----

	O ideal seria criar um objeto json para cada pixel, contendo r, g,b,a e a sua coordenada x,y. Atualmente as informações dos pixels são armazenadas sequencialmente
	0 equivale ao R do primeiro pixel, 1 equivale ao b do primeiro pixel...4 equivale ao r do segundo pixel....

*/

var Engine = function(elem)
{
	var Handler = {};
	var HTML = {};
	var Tool = {};
	var IU = {};

	Handler.Algorithms = {};
	Handler.Helper = {};
	Handler.Protypes = {};
	Handler.Vars = {};

	HTML.Templates = {};

	IU.Animation = {};
	IU.Events = {};
	IU.Engine = {};
	IU.Engine.Drag = {};
	IU.Load = {};
	IU.Unset = {};
	IU.Unload = {};

	this.Init = function()
	{
		Handler.Start();
	}

	Handler.Start = function()
	{
		Handler.Vars.Config = {};
		Handler.Vars.Eye = new Handler.Protypes.Eye();
		Handler.Vars.Images = [];
		Handler.Vars.Selected = {};
		Handler.Vars.Tool = {};
		Handler.Vars.Version = 0;

		Handler.Vars.Config.width = 50000;
		Handler.Vars.Config.height = 50000;
		Handler.Vars.Config.window_height = $('body').height();
		Handler.Vars.Config.window_width = $('body').width();

		Tool.elem = $('NULL');
		Tool.popover = false;
		Tool.name = "nada";

		HTML.Container = elem;
		HTML.DrawSpace = $("#v-draw-space");
		HTML.Nav_Bar = $(".v-nav-bar");
		HTML.Side_Bar = $(".v-side-bar");
		HTML.Properties_Bar = {};
		HTML.Properties_Bar.Elem = $('.v-properties-bar');
		HTML.Properties_Bar.Caracteristicas = $(".v-properties-bar").find("#v-properties-caracteristicas").find('.v-properties-body');
		HTML.Properties_Bar.Historico = $(".v-properties-bar").find("#v-properties-historico").find('.v-properties-body');
		HTML.Properties_Bar.Histograma = $(".v-properties-bar").find("#v-properties-histograma").find('.v-properties-body');

		//google.charts.load('current', {'packages':['corechart']}); // ------ biblioteca do google para charts -----

		IU.Load.AlgorithmsAsks();// "carrega" todos os parametros dos algoritmos que serão informados
		IU.Load.SideBar();
		IU.Events.Document();
		IU.Engine.Start();
	}

	/* ------------------------ Nas funções abaixo estão as técnicas implementadas, é aqui que estão os algoritmos -------------------------*/

	Handler.Algorithms.Gama = function(asks)
	{

		var temp = new Handler.Protypes.CanvasImage(Handler.Vars.Selected.content.width, Handler.Vars.Selected.content.height);
		var add = parseInt(asks[0].value);
		var defaults = [];
		var tecnica = {};

		for(var i = 0; i < Handler.Vars.Selected.content.data.length; i++)
		{
			var data = Handler.Vars.Selected.content.data[i];
			temp.img.data[i] = data;
		}

		for(var i = 0; i < temp.img.data.length; i += 4)
		{
			var r = temp.img.data[i];
			var g = temp.img.data[i+1];
			var b = temp.img.data[i+2];

			defaults.push(temp.img.data[i]);
			defaults.push(temp.img.data[i+1]);
			defaults.push(temp.img.data[i+2]);

			if(r + add > 255)
				temp.img.data[i] = 255;
			else if(r + add < 0)
				temp.img.data[i] = 0;
			else
				temp.img.data[i] += add;

			if(g + add > 255)
				temp.img.data[i+1] = 255;
			else if(g + add < 0)
				temp.img.data[i+1] = 0;
			else
				temp.img.data[i+1] += add;

			if(b + add > 255)
				temp.img.data[i+2] = 255;
			else if(b + add < 0)
				temp.img.data[i+2] = 0;
			else
				temp.img.data[i+2] += add;
		}

		tecnica.name  = "Modificação de brilho";
		tecnica.asks = asks;
		IU.Load.ImageNew(temp.img, tecnica);
	}
	Handler.Algorithms.Binarization = function(img, threshold)
	{
		var width = img.width;
		var height = img.height;
		var temp = new Handler.Protypes.CanvasImage(width, height);

		for(var x = 0; x < height; x++)
		{
			for(var y = 0; y < width; y++)
			{
				var indice =  (y + x * width) * 4; // pois, o array de pixels é sequencial e não uma matriz.
				if(img.data[indice] < threshold[indice])
				{
					temp.img.data[indice] = 0;
					temp.img.data[indice + 1] = 0;
					temp.img.data[indice + 2] = 0;
					temp.img.data[indice + 3] = 255;
				}
				else
				{
					temp.img.data[indice] = 255;
					temp.img.data[indice + 1] = 255;
					temp.img.data[indice + 2] = 255;
					temp.img.data[indice + 3] = 255;
				}
			}
		}
		return temp.img;
	}
	Handler.Algorithms.Convolution = function(n, max, img, mask)
	{	
		if(n < max)
		{
			var data = img.data;
			var height =  img.height;
			var width = img.width;
			var temp = new Handler.Protypes.CanvasImage(width, height);

			for(var x = 0; x < height; x++)
			{
				for(var y = 0; y < width; y++)
				{
					var channels = new Handler.Protypes.Channels();
					var indice =  (y + x * width) * 4; // pois, o array de pixels é sequencial e não uma matriz.

					for(var i = 0; i < mask.ordem; i++)
					{
						for(var j = 0; j < mask.ordem; j++)
						{
							var vx = x + i - mask.half; //indice do vizinho conforme a matriz. É o indice X.
							var vy = y + j - mask.half; //indice do vizinho conforme a matrix. É o indice Y.

							if(vx >= 0 && vy >= 0 && vx < height && vy < width)
							{
								var indice_vizinho = (vy + vx * width) * 4;
								var number = mask.matriz[j][i];

								channels.red += data[indice_vizinho] * number;
								channels.green += data[indice_vizinho + 1] * number;
								channels.blue += data[indice_vizinho + 2] * number;
							}
						}
					}

					temp.img.data[indice + 0] = channels.red;
					temp.img.data[indice + 1] = channels.blue;
					temp.img.data[indice + 2] = channels.green;
					temp.img.data[indice + 3] = 255;
				}
			}
			return Handler.Algorithms.Convolution(n+1, max, temp.img, mask);
		}
		else
			return img;
	}
	Handler.Algorithms.Laplace = function(img_one, img_two)
	{
		var height = img_one.height;
		var width = img_one.width;
		var laplace = [];
		for(var x = 0; x < height; x++)
		{
			for(var y = 0; y < width; y++)
			{
				var indice = (y + x * width) * 4;
				if(img_one.data[indice] - img_two.data[indice] > 0)
					laplace[indice] = 1;
				else
					laplace[indice] = -1;
			}
		}
		return laplace;
	}
	Handler.Algorithms.LogDog = function(asks)
	{
		var alfa;
		var img_one;
		var img_two;
		var img_one_count;
		var img_two_count;
		var laplace;
		var threshold;
		var img_bin;
		var mask = new Handler.Protypes.Mask([1 ,2 ,1, 2, 4, 2, 1, 2, 1], 16, 3);
		var img_original = Handler.Vars.Selected.content;
		var tecnica = {};

		for(var i = 0; i < asks.length; i++)
		{
			var ask = asks[i];
			if(ask.name == "Alfa")
				alfa = ask.value;
			else if(ask.name == "Número de convoluções da imagem 1")
				img_one_count = ask.value;
			else if(ask.name == "Número de convoluções da imagem 2")
				img_two_count = ask.value;
		}

		img_one = Handler.Algorithms.Convolution(0, img_one_count, img_original, mask);
		img_two = Handler.Algorithms.Convolution(0, img_two_count, img_one, mask);

		laplace = Handler.Algorithms.Laplace(img_one, img_two);
		threshold = Handler.Algorithms.Threshold(img_two, laplace, alfa
			);
		img_bin = Handler.Algorithms.Binarization(img_one, threshold);

		tecnica.name = "Log Dog";
		tecnica.asks = asks;
		IU.Load.ImageNew(img_bin, tecnica);
	}
	Handler.Algorithms.Threshold = function(img, laplace, alfa)
	{
		var height = img.height;
		var width = img.width;
		var threshold = [];
		for(var x = 0; x < height; x++)
		{
			var black = 0;
			var white = img.data[x * width * 4];
			var signal = laplace[x * width * 4];
			for(var y = 0; y < width; y++)
			{
				var indice = (y + x * width) * 4;
				if(x != 0 && signal > laplace[indice])
				{
					signal = laplace[indice];
					black = img.data[indice];
				}
				else if(x != 0 && signal < laplace[indice])
				{
					signal = laplace[indice];
					white = img.data[indice];
				}

				threshold[indice] = alfa * ((white + black) / 2 );
			}
		}
		return threshold;
	}

	/* --------------------------------------------------- Funções que auxiliam o programa todo --------------------------------------------------------*/

	Handler.Helper.CalculateHistograma =  function(img)
	{
		var scale = {};
		var data = img.content.data;

		for(var i = 0; i < 256; i++)
		{
			scale[ ""+i ] = {};
			scale[ ""+i ].Red = 0;
			scale[ ""+i ].Green = 0;
			scale[ ""+i ].Blue = 0;
		}
		for(var i = 0; i < data.length; i += 4)
		{
			scale[data[i]].Red += 1;
			scale[data[i+1]].Green += 1;
			scale[data[i+2]].Blue += 1;
		}
		
		img.histograma = scale;
	}
	Handler.Helper.Histograma = function(elem, obj)
	{
      	google.charts.setOnLoadCallback(drawChart);

      	function drawChart() 
      	{
      		var histo = [];
      		histo.push(['Nível de Cinza', 'Red', 'Green', 'Blue'])
      		for(var i = 0; i < 256; i++)
      		{
      			var scale = obj.imgObj.histograma[i];
      			histo.push([i, scale.Red, scale.Green, scale.Blue]);
      		}

	        var data = google.visualization.arrayToDataTable(histo);

	        var options = {
	          legend: { position: 'bottom' },
	          colors: ['red', 'green', 'blue'],
	          width:270,
	          height:400,
	          'margin-left':-5,
	          'margin-top':0,
	          background:'none'
	        };
	        var chart = new google.visualization.LineChart(elem);
        	chart.draw(data, options);
        }
	}

	/* ----------------------------------------- São notações de objetos que auxiliam na organização e contro dos elementos --------------------------------------*/

	Handler.Protypes.AlgorithmsConfig =  function()
	{
		this.name =  null;
		this.regex = null;
		this.error =  null;
		this.type = null;
		this.values = null;
	}
	Handler.Protypes.CanvasImage = function( width, height)
	{
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.img = this.context.createImageData(width, height);
	}
	Handler.Protypes.Channels = function()
	{
		this.red = 0;
		this.green =  0;
		this.blue = 0;
		this.alfa = 0;
	}
	Handler.Protypes.Eye = function()
	{
		this.frame;
		this.scale = 1;
		this.x = 0;
		this.y = 0;
	}
	Handler.Protypes.Image = function()
	{
		this.elem;
		this.id;
		this.frame;
		this.scale = 1;
		this.x = 0;
		this.y = 0;
		this.name;
		this.version  = 0;
		this.histograma = {};
		this.history = [];
		this.content;
	}
	Handler.Protypes.Mask = function(values, divisor, ordem)
	{
		this.ordem = ordem;
		this.half = Math.floor(this.ordem/2);
		this.matriz = [];

		for(var i = 0; i < this.ordem; i++)
		{
			this.matriz[i] = [];
			for(var j = 0; j < this.ordem; j++)
			{
				this.matriz[i][j] = values[i * ordem + j]/divisor;
			}
		}
	}

	/* ----------------------------------------------------- Componentes HTML que serão carregados conforme demanda -----------------------------------------------*/

	HTML.Templates.Askable_Body =  function(ask, config)
	{
		var template = '';
		template += '<div class = "v-modal-ask-line">'
		template += '<table class = "table table-striped">'
		template += '<tbody>'
		template += '<thead>'
		template += '<th style = "width:'+ ((config.width/2) - 10) +'px"> Nome </th>'
		template += '<th style = "width:'+ ((config.width/2) - 10) +'px"> Valor </th>'
		template += '</thead>'
		for(var i = 0; i < ask.length; i++)
		{
			template += '<tr class = "v-modal-ask">';
			template += '<td>';
			template += ask[i].name;
			template += '</td>';
			template += '<td>';
			template += '<input type = '+ ask[i].type +'>';
			template += '</td>';
			template += '</tr>';
		}

		template += '</tbody>'
		template += '</table>'
		template += '</div>'
		return template;
	}
	HTML.Templates.Askable_Head =  function(ask)
	{
		var template = '';
		template += '<div class = "v-modal-head-line">'
		template += '<span class = "glyphicon glyphicon-info-sign" style = "font-size:18px; margin-top:10px !important;"></span>'
		template += ' <span style = "margin-top:-10px,">Informe o valor que serão usados na técnica selecionada</span>'
		template += '</div>'		
		return template;
	}
	HTML.Templates.Askable_Footer =  function()
	{
		var template = '';

		template += '<div class = "v-modal-footer-line">'
		template += '<div class = "v-btn-cancel">'
		template += '<span class = "glyphicon glyphicon-remove"></span>'
		template += '</div>'
		template += '<div class = "v-btn-apply">'
		template += '<span class = "glyphicon glyphicon-ok"></span>';
		template += '</div>'
		template += '</div>'

		return template;
	}
	HTML.Templates.Loader =  function(width, height)
	{
		var template = '';
		var margin_top = (height - 110)/2;
		var margin_left = (width - 110)/2;
		template += '<img src = "img/animation.svg" style = "width:100px; height:100px; margin-left:'+ margin_left +'px; margin-top:'+ margin_top +'px">'
		return template;
	}
	HTML.Templates.Load_New_Image =  function(name, id, original)
	{
		var template = '';
		template += '<div id = "v-img-'+ id +'" class = "v-window" data-id = "'+ id +'">'
		template += '<div class = "v-window-nav">'
		template += '<div class = "v-window-nav-left">'
		if(!original)
			template += name + " " + id;
		else
			template += name;

		template += '</div>'
		template += '<div class = "v-window-nav-right">'
		template += '<span class = "glyphicon glyphicon-remove"></span>'
		template += '</div>'
		template += '</div>'
		template += '<canvas id = "v-img-canvas-'+ id +'" style = "float:left;" draggable="true"></canvas>';
		template += '</div>';
		return template;
	}
	HTML.Templates.Modal =  function(config)
	{
		var template = '';
		var margin_top = $('body').height() /2 - config.height/2;
		template += '<div class = "v-modal-background">'
		template += '<div class = "v-modal" style = "width:'+ config.width +'px; height:'+ config.height +'px; margin-top:'+ margin_top +'px; background:none">'
		template += '<div class = "v-modal-content">'
		template += '<div class = "v-modal-head" style = "height:'+ config.head_height +'">'
		template += '</div>'
		template += '<div class = "v-modal-body" style = "height:'+ config.body_height +'">'
		template += '</div>'
		template += '<div class = "v-modal-footer" style = "height:'+ config.footer_height +'">'
		template += '</div>'
		template += '</div>'
		template += '</div>'
		template += '</div>'
		return template;
	}
	HTML.Templates.Open_Image =  function()
	{
		var template = '';
		template += '<div style = "float:left; height:50px; width:300px">';
		template += '<input id = "v-input-load" type = "file" name="upload" accept="image/*" style = "width: 0px; height: 0px; overflow:hidden;">'; //este elemento é oculto, pois, a estética dele é feia e por este motivo foi criado os elementos abaixo.
		template += '<input id = "v-input-info" type = "text" readonly style = "float:left; height:40px; text-align:center">';//para melhorar a aparência estética!
		template += '<div id = "btn-search" class = "v-load-file" title = "Procurar">'
		template += '<span class = "glyphicon glyphicon-search"></span>'
		template += '</div>'
		template += '<div id = "btn-submit" class = "v-submit-file" title = "Carregar">'
		template += '<span class = "glyphicon glyphicon-ok"></span>'
		template += '</div>'
		template += '</div>';
		return template;
	}
	HTML.Templates.Popover = function()
	{
		var template = '';
		template += '<div class="popover" role="tooltip">'
		template += '<div class="arrow"></div>';
		template += '<div class="popover-content"></div>'
		template += '</div>'
		return template;
	}
	HTML.Templates.Popover_Menu = function()
	{
		var template = '';
		template += '<div class="popover v-popover-menu" role="tooltip">'
		template += '<div class="arrow"></div>';
		template += '<div class="popover-content v-popover-menu-content"></div>'
		template += '</div>'
		return template;
	}
	HTML.Templates.Properties_Caracteristicas = function(obj)
	{
		var template = '';
		template += '<b>Nome: </b>'+ obj.imgObj.name +"<br>";
		return template;
	}
	HTML.Templates.Properties_Histograma = function(obj)
	{
		var template = '';
		template += 'Ainda não foi desenvolvida.';
		return template;
	}
	HTML.Templates.Properties_Historico = function(obj)
	{
		var template = "";
		if(obj.imgObj.history.length > 0)
		{
			for(var i = 0; i < obj.imgObj.history.length; i++)
			{
				var end = "";
				var history = obj.imgObj.history[i];
				end += "<b>"+ history.name +"</b>";

				if(history.asks.length > 0)
					end+= "(com ";

				for(var j = 0; j < history.asks.length; j++)
				{
					var ask = history.asks[j];
					end += ask.name +" = "+ ask.value;

					if(j + 1 != history.asks.length)
						end +=', '
				}

				if(history.asks.length > 0)
					end+= " )";

				if(i + 1 == obj.imgObj.history.length)
					template +=  end +" "
				else
					template += end +' <span style = "font-size:14px; color:red" class = "glyphicon glyphicon-arrow-right"></span> '
			}
		}
		else
			template += "Nada foi feito até o momento.";
		return template;
	}
	HTML.Templates.Side_Bar = function()
	{
		var template = '';
	    template += '<div id = "v-open-image" class = "v-side-bar-item v-side-bar-item-top v-side-bar-item-watch" title = "Abrir imagem" data-placement="right" data-opt = "Open">'
        template += '<span class = "glyphicon glyphicon-folder-open"></span>'
	    template += '</div>';

	    template += '<div class = "v-side-bar-item v-side-bar-item-mid v-side-bar-item-unwatch" title = "Limiarização" data-placement="right" data-opt = "Limiariazação">'
        template += '<span class = "glyphicon glyphicon-tint"></span>'
	    template += '</div>'
	    template += '<div id = "v-properties-image" class = "v-side-bar-item v-side-bar-item-mid v-side-bar-item-unwatch" title = "Barra de propriedades" data-placement="right" data-opt = "Properties">'
        template += '<span class = "glyphicon glyphicon glyphicon-info-sign"></span>'
	    template += '</div>';

	    template += '<div id = "v-stop-image" class = "v-side-bar-item v-side-bar-item-bottom v-side-bar-item-unwatch" title = "Parar edição" data-placement="right" data-opt = "Unload">'
        template += '<span class = "glyphicon glyphicon-eye-close"></span>'
	    template += '</div>';

		return template;	
	}
	HTML.Templates.Threshold = function()
	{
		var template = '';
		template += '<div class = "v-menu-item" data-opt = "Gama">';
		template += 'Modificação de brilho';
		template += '</div>';
		template += '<div class = "v-menu-item" data-opt = "LogDog">'
		template += 'LogDog'
		template += '</div>'
		return template;
	}

	/* ----------------------------------------- São funções que gerenciam animações da interface --------------------------------------*/

	IU.Animation.ChangeColor = function(elem, select)
	{
		if(select)
		{
			elem.css({
				'background': 'var(--SystemPrimary)',
				'color': 'var(--SystemSecondary)'
			});
		}
		else
		{
			elem.css({
				'background': 'none',
				'color': 'var(--SystemPrimary)'
			});	
		}
	}

	
	/* ---------------------- Nas funções abaixo é onde ocorrem inferências de controle dos objetos bem como arrastar, zoom e etc ------------------------*/

	IU.Engine.Drag.Start = function()
	{
		d3.event.sourceEvent.stopPropagation();
		d3.event.sourceEvent.preventDefault();
		$(this).trigger('click');
		// nothing else matter
	}
	IU.Engine.Drag.Ed = function()
	{	
		var d;

		for(var i = 0; i < Handler.Vars.Images.length; i++)
		{
			d = Handler.Vars.Images[i];
			if($(d.frame)[0] == this)
				break;
		}

		d.x += d3.event.dx;
		d.y += d3.event.dy;

		$(d.frame).css("transform", "translate("+ (d.x) +"px,"+ (d.y) +"px)scale("+ d.scale +")");
	}
	IU.Engine.Drag.End = function()
	{
		// nothing else matter
		d3.event.sourceEvent.stopPropagation();
		d3.event.sourceEvent.preventDefault();
	}
	IU.Engine.Start = function()
	{
		Handler.Vars.Eye.frame = HTML.DrawSpace;	
		Handler.Vars.Eye.x = Handler.Vars.Config.width/2;
		Handler.Vars.Eye.y = Handler.Vars.Config.height/2;

		Handler.Vars.Eye.frame.css({
			width: Handler.Vars.Config.width,
			height: Handler.Vars.Config.height
		})

		HTML.DrawSpace.css('transform', 'translate(-'+ Handler.Vars.Eye.x +'px, -'+ Handler.Vars.Eye.y +'px)');
	}
	IU.Engine.Start_Image = function(d)
	{
		var zoom = d3.zoom()
			.on("zoom", IU.Engine.Zoom)

		var drag = d3.drag()
		    .on("start", IU.Engine.Drag.Start)
		    .on("drag", IU.Engine.Drag.Ed)
		    .on("end", IU.Engine.Drag.End)

		d3.select(d.frame)
			.call(drag)
			.call(zoom)

		$(d.frame).css('transform', 'translate('+ Handler.Vars.Config.width/2 +'px,'+ Handler.Vars.Config.height/2 +'px)');

		d.x = Handler.Vars.Config.width/2;
		d.y = Handler.Vars.Config.height/2;
	}
	IU.Engine.Zoom = function()
	{
		var d;
		for(var  i = 0; i < Handler.Vars.Images.length; i++)
		{
			d = Handler.Vars.Images[i];
			if($(d.frame)[0] == this)
				break;
		}
		d.scale = d3.event.transform.k;
		if(d.scale < 0.1)
			d.scale = 0.1;


		$(d.frame).css("transform", "translate("+ (d.x) +"px,"+ (d.y) +"px)scale("+ d.scale +")");
		$(d.frame).trigger('click');
	}

	/* ------------------------------------------ São funções que carregam eventos de determinandos elementos da interface -----------------------------------------*/

	IU.Events.Document = function()
	{

		$( window ).resize(function(ev)
		{
			ev.preventDefault();
		})

		$(".v-side-bar-item").unbind('mouseover').on('mouseover', function(ev)
		{
			var elem = $(this);
			var opt = elem.data("opt");

			if(Tool.elem[0] != elem[0] || (opt == Tool.name && !Tool.popover) )					
				elem.tooltip('toggle');

			IU.Animation.ChangeColor(elem, true);
		})
		$(".v-side-bar-item").unbind('mouseleave').on('mouseleave', function(eve)
		{
			var elem = $(this);
			var opt = elem.data("opt");

			if((Tool.name != opt && opt != "Properties") || (!Handler.Vars.PropertiesWatch && opt == "Properties"))
				IU.Animation.ChangeColor(elem, false);
		})

		$(".v-side-bar-item").unbind('click').on('click', function(ev)
		{
			var elem = $(this);
			var id = elem.attr('id');
			var opt = elem.data("opt");

			if(Tool.name != opt)
				IU.Unset.Tool();

			if(opt == "Properties")
			{
				if(Handler.Vars.PropertiesWatch)
				{
					Handler.Vars.PropertiesWatch = false;	
					IU.Unload.Propperties();
					IU.Unset.Tool();
					IU.Animation.ChangeColor(elem, false);
				}
				else
				{
					Handler.Vars.PropertiesWatch = true;
					IU.Load.Propperties();
					IU.Animation.ChangeColor(elem, true);
				}
			}
			else if(Tool.name != opt)
			{
				Tool.elem = elem;
				Tool.name = opt;

				if(opt == "Limiariazação")
				{
					Tool.popover = true;
					IU.Load.Menu(opt);
					Tool.elem.popover('toggle');
					IU.Events.SideBarMenu();
				}
				else if(opt == "Open")
				{
					Tool.popover = true;
					IU.Load.Popovers();
					Tool.elem.popover('toggle');
					IU.Events.Popover();
				}
				else if(opt == "Unload")
					IU.Unload.Interface();

				IU.Animation.ChangeColor(elem, true);
			}
			else
				IU.Unset.Tool();

			ev.preventDefault();
		})
	}
	IU.Events.Image = function(elem)
	{
		elem.unbind('click').on('click', function(ev)
		{
			var object;
			for(var i = 0; i < Handler.Vars.Images.length; i++)
			{
				var obj = Handler.Vars.Images[i];
				if(obj.elem[0] == this)
				{
					object = obj;
					break;
				}
			}

			if(Handler.Vars.Selected.elem)
			{
			 	$(Handler.Vars.Selected.elem).css({
			 		"border": "solid 1px rgba(0,0,0,0.1)",
			 		"z-index": 2
			 	});
			 	$(Handler.Vars.Selected.elem).find(".v-window-nav").css({
			 		"background":"rgba(255,255,255,1)",
			 		"color" : "rgba(0,0,0,0.4)"
			 	})
			}
			$(this).css({
				"border": "solid 1px rgba(0,0,0,0.5)",
				"z-index":3
			});

			$(this).find(".v-window-nav").css({
		 		"background":"rgba(0,0,0,0.7)",
		 		"color" : "rgba(255,255,255,1)"
		 	})

			Handler.Vars.Selected.content = object.content;
			Handler.Vars.Selected.elem = elem;
			Handler.Vars.Selected.imgObj = object;

			IU.Load.Propperties();
			ev.preventDefault();
		})
	}
	IU.Events.ImageNav = function(elem)
	{
		var id = $(elem).attr('data-id');
		$(elem).find('.v-window-nav-right').unbind('click').on('click', function(ev)
		{
			$(this).parent().parent().remove();

			for(var i = 0; i < Handler.Vars.Images.length; i++)
			{
				var image = Handler.Vars.Images[i];
				if(id == image.id)
				{
					Handler.Vars.Images.splice(i, 1);
					if(Handler.Vars.Selected.elem.attr('data-id') == id)
					{
						Handler.Vars.Selected = {};
						IU.Unset.Properties();
					}
					break;
				}
			}

			if(Handler.Vars.Images.length == 0)
				$('#v-stop-image').trigger('click');

			ev.preventDefault();
		})
	}
	IU.Events.Popover = function()
	{
		// essa função apenas descreve o comportamento dos eventos do popover de carregar imagem. São uma série de trativas para carregar uma imagem qualquer uma vez que a mesma esteja carregada.
		$('#btn-search').unbind('click').on('click', function(evtLoad)
		{
			evtLoad.preventDefault();
			$('#v-input-load').trigger('click');
			$('#v-input-load').unbind('change').on('change', function(loaded)
			{
				var files = loaded.target.files;
				$("#v-input-info").val(files[0].name);
				$("#btn-submit").unbind('click').on('click', function(evt)
				{
					evt.preventDefault();
					var fr = new FileReader();
			        fr.onload = function () {
			            IU.Load.Image(fr.result, files[0]);
	            		IU.Unset.Tool();	
	            		if(Handler.Vars.Images.length == 0)
	            		{
							$('.v-side-bar-item-unwatch').switchClass( "v-side-bar-item-unwatch", "v-side-bar-item-watch", 300 );
							setTimeout(function()
							{
								if(!Handler.Vars.PropertiesWatch)
									$("#v-properties-image").trigger('click');
							}, 310);
						}
			        }
			        fr.readAsDataURL(files[0]);
				})
			})
		})
	}
	IU.Events.SideBarMenu = function()
	{
		$(".v-menu-item").unbind('click').on('click', function(ev)
		{
			var elem = $(this);
			setTimeout(function()
			{
				var mod = elem.attr('data-mod');
				var opt = elem.attr('data-opt');
				IU.Unset.Tool();

				if(Handler.Vars.Selected.elem)
				{
					var algorith_config = Handler.Vars.Algorithms[opt];
					var modal_config = {
						head_height : "50px",
						body_height : ((50 * algorith_config.length) + 50) +"px",
						footer_height : "50px",
						height: 165 + (50 * algorith_config.length),
						width: 600
					}

					if(opt == "LogDog")
						IU.Load.Modal("askable", modal_config, algorith_config, Handler.Algorithms.LogDog);
					else if(opt == "Gama")
						IU.Load.Modal("askable", modal_config, algorith_config, Handler.Algorithms.Gama);
				}
				else
				{
					alert("Por favor selecionar uma imagem. Basta clicar!");
					IU.Unload.Modal();
				}

				ev.preventDefault();
			},50)
		})
	}

	/* ----------------------------------------- São funções que carregam elementos e objetos para serem utilizados --------------------------------------*/

	IU.Load.AlgorithmsAsks = function()
	{
		var algorithms_askable = {};
		var alfa_dog = new Handler.Protypes.AlgorithmsConfig();
		var conv_one_dog = new Handler.Protypes.AlgorithmsConfig();
		var conv_two_dog = new Handler.Protypes.AlgorithmsConfig();
		var gama_gama = new Handler.Protypes.AlgorithmsConfig();
		algorithms_askable.LogDog = [];
		algorithms_askable.Gama = [];

		alfa_dog.name = "Alfa";
		alfa_dog.regex = new RegExp("^[0-9]{1,}(\.{1}[0-9]{1,}){0,1}$");
		alfa_dog.error = "O valor informado está errado. Não é um número válido.";
		alfa_dog.type = "Text";
		alfa_dog.values = null;

		conv_one_dog.name = "Número de convoluções da imagem 1";
		conv_one_dog.regex = new RegExp("^[0-9]{1,}$");
		conv_one_dog.error = "O valor informado está errado. Não é um número válido para aplicar na convolução.";
		conv_one_dog.type = "Text";
		conv_one_dog.values = null;

		conv_two_dog.name = "Número de convoluções da imagem 2";
		conv_two_dog.regex = new RegExp("^[0-9]{1,}$");
		conv_two_dog.error = "O valor informado está errado. Não é um número válido para aplciar na convolução.";
		conv_two_dog.type = "Text";
		conv_two_dog.values = null;

		gama_gama.name = "Gama";
		gama_gama.regex = new RegExp("^\-{0,1}[0-9]{1,}$");
		gama_gama.error = "O valor informado está errado. Não é um número válido para ampliar o gama.";
		gama_gama.type = "Text";
		gama_gama.values = null;

		algorithms_askable.LogDog.push(alfa_dog);
		algorithms_askable.LogDog.push(conv_one_dog);
		algorithms_askable.LogDog.push(conv_two_dog);

		algorithms_askable.Gama.push(gama_gama);
		Handler.Vars.Algorithms = algorithms_askable;
	}
	IU.Load.Image = function(img, imgObj)
	{

		var modal_config = 
		{
			head_height : "5px",
			body_height : "120px",
			footer_height : "5px",
			height: 150,
			width: 130
		}

		IU.Load.Modal('loader', modal_config);

		var canvas;
		var width;
		var height;
		var canvasContext;
		var image = new Image();
		var to_add_imgObj = new Handler.Protypes.Image();
		var name  =  imgObj.name;
		var version = Handler.Vars.Version + 1;
		var id = "v-img-canvas-"+ version;

		HTML.DrawSpace.append(HTML.Templates.Load_New_Image(name, version, true));
		canvas = document.getElementById(id);
        image.onload = function() 
        {
			width = this.width;
			height = this.height;

			canvas.width = width;
			canvas.height = height;

			canvasContext = canvas.getContext('2d');
          	canvasContext.drawImage(this,0, 0);
     
			to_add_imgObj.elem  = $(canvas).parent();
			to_add_imgObj.frame = "#v-img-"+ version;
			to_add_imgObj.id = version;
			to_add_imgObj.name = name;
			to_add_imgObj.version = 0;
			to_add_imgObj.content = canvasContext.getImageData(0,0, canvas.width, canvas.height);
			
			Handler.Vars.Version = version;

			Handler.Helper.CalculateHistograma(to_add_imgObj);
			IU.Events.ImageNav($(canvas).parent());
          	IU.Events.Image($(canvas).parent());
          	Handler.Vars.Images.push(to_add_imgObj);
          	IU.Engine.Start_Image(to_add_imgObj);
          	IU.Unload.Modal();

          	$($(canvas).parent()).trigger('click');
        };
        image.src = img;
	}
	IU.Load.ImageNew = function(img, step)
	{
		var canvas;
		var canvasContext;
		var imgObj = new Handler.Protypes.Image();
		var original = Handler.Vars.Selected.imgObj;
		var name = original.name;
		var version = Handler.Vars.Version + 1;
		var id = "v-img-canvas-"+ version +"";

		HTML.DrawSpace.append(HTML.Templates.Load_New_Image(name,  version));
		canvas = document.getElementById(id);

		canvas.width = img.width;
		canvas.height = img.height;

		canvasContext = canvas.getContext('2d');
		canvasContext.putImageData(img,0, 0);

		imgObj.elem = $(canvas).parent();
		imgObj.frame = "#v-img-"+ version;
		imgObj.id = version
		imgObj.name = name;
		imgObj.version = version;
		imgObj.content = canvasContext.getImageData(0,0, canvas.width, canvas.height);
			
		for(var i = 0; i < original.history.length; i++)
			imgObj.history.push(original.history[i]);
		imgObj.history.push(step);

		Handler.Vars.Version = version;

		Handler.Helper.CalculateHistograma(imgObj);
		Handler.Vars.Images.push(imgObj);
		IU.Events.ImageNav($(canvas).parent());
		IU.Events.Image($(canvas).parent());
		IU.Engine.Start_Image(imgObj);
		IU.Unload.Modal();

		$($(canvas).parent()).trigger('click');
	}
	IU.Load.Menu = function(opt)
	{
		if(opt == "Limiariazação")
		{
			Tool.elem.popover(
			{
				html:true,
				placement:"right",
				container:"body",
				content: HTML.Templates.Threshold(),
				trigger:"manual",
				template: HTML.Templates.Popover_Menu()
			})
		}
	}
	IU.Load.Modal = function(type, config, to_ask, call_back)
	{
		$('.v-modal-background').remove();
		$('body').append(HTML.Templates.Modal(config));
		if(type == 'loader')
		{
			$('.v-modal-content').css("background", "none");
			$('.v-modal').css("border", "none");
			$('.v-modal-background').find('.v-modal-body').append(HTML.Templates.Loader(config.width, config.height));
		}
		else if(type == 'askable')
		{

			$('.v-modal-background').find('.v-modal-head').append(HTML.Templates.Askable_Head());
			$('.v-modal-background').find('.v-modal-body').append(HTML.Templates.Askable_Body(to_ask, config));
			$('.v-modal-background').find('.v-modal-footer').append(HTML.Templates.Askable_Footer());

			$('.v-modal-footer').find('.v-btn-apply').on("click", function(ev)
			{
				var isValid = true;
				var variables = [];
				$('.v-modal-body').find('.v-modal-ask').each(function()
				{

					var name = $($(this).find('td').get(0)).text();
					var value = $($(this).find('td').get(1)).find('input').val();
					var ask;

					for(var i = 0; i < to_ask.length; i++)
						if(to_ask[i].name == name)
						{
							ask = to_ask[i];
							break;
						}

					isValid = ask.regex.test(value);
					if(isValid)
						variables.push({name:name, value:value});
				})

				if(isValid)
				{
					var modal_config = 
					{
						head_height : "5px",
						body_height : "120px",
						footer_height : "5px",
						height: 150,
						width: 130
					}

					IU.Load.Modal('loader', modal_config);
					call_back(variables);
				}
				ev.preventDefault();
			})
			$('.v-modal-footer').find('.v-btn-cancel').on("click", function(ev)
			{
				IU.Unload.Modal(true);
				ev.preventDefault();
			})
		}
	}
	IU.Load.Propperties = function()
	{
		if(Handler.Vars.PropertiesWatch)
		{
			var current = Handler.Vars.Selected;

			HTML.Properties_Bar.Caracteristicas.empty().append(HTML.Templates.Properties_Caracteristicas(current));
			HTML.Properties_Bar.Historico.empty().append(HTML.Templates.Properties_Historico(current));
			HTML.Properties_Bar.Histograma.empty().append(HTML.Templates.Properties_Histograma(current));

			HTML.Properties_Bar.Histograma.empty();
			//Handler.Helper.Histograma(HTML.Properties_Bar.Histograma[0], current);

			$(".v-properties-bar").show();
		}
	}
	IU.Load.Popovers = function()
	{
		$("#v-open-image").popover(
		{
			html:true,
			placement:"right",
			title:"Abrir imagem",
			container:"body",
			content: HTML.Templates.Open_Image(),
			trigger:"manual",
			template: HTML.Templates.Popover()
		})
	}
	IU.Load.SideBar = function()
	{
		var width = HTML.Container.width() - 60;

		Handler.Vars.SideBar = true;
		HTML.Container.css({
			width: width
		})
		HTML.Side_Bar.fadeIn(300);

		HTML.Side_Bar.append(HTML.Templates.Side_Bar());
	}

	/* ------------------------------------------- Reseta elementos HTML criados e remove o que ja não é mais necessário ----------------------------------------*/

	IU.Unload.Interface = function()
	{
		$('.v-side-bar-item-watch').switchClass( "v-side-bar-item-watch", "v-side-bar-item-unwatch", 0 );
		$('#v-open-image').switchClass( "v-side-bar-item-unwatch", "v-side-bar-item-watch", 300 );

		HTML.DrawSpace.empty();
		HTML.DrawSpace.animate({ 'zoom': Handler.Vars.Scale }, 50);

		Handler.Vars.Version = 0;
		Handler.Vars.Images = [];
		Handler.Vars.Selected = {};

		IU.Unset.Tool();
		IU.Unload.Propperties();
	}

	IU.Unload.Modal = function(now)
	{
		if(!now)
		{
			setTimeout(function(){
				$('.v-modal-background').remove();	
			},300)
		}
		else
			$('.v-modal-background').remove();
	}
	IU.Unload.Propperties = function()
	{
		HTML.Properties_Bar.Caracteristicas.empty();
		HTML.Properties_Bar.Historico.empty();
		HTML.Properties_Bar.Histograma.empty();
		HTML.Properties_Bar.Elem.hide();
	}

	/* ------------------------------------------- Controla variavéis e elementos do HTML para retroceder ao estado original ----------------------------------------*/

	IU.Unset.Properties =  function()
	{
		HTML.Properties_Bar.Caracteristicas.empty().append("Nada selecionado.");
		HTML.Properties_Bar.Historico.empty().append("Nada selecionado.");
		HTML.Properties_Bar.Histograma.empty().append("Nada selecionado.");
	}
	IU.Unset.Tool = function()
	{
		if(Tool.elem)
		{
			Tool.elem.css({
				'background': 'none',
				'color': 'var(--SystemPrimary)'
			});
		}
		if(Tool.popover)
		{
			Tool.elem.popover('toggle');
			Tool.elem.popover('destroy');
		}

		IU.Animation.ChangeColor(elem, false);

		Tool.elem = $('NULL');
		Tool.popover = false;
		Tool.name = "nada";
	}
	/* ----------------------------------------------------------------------- FIM ----------------------------------------------------------------------------------*/
}