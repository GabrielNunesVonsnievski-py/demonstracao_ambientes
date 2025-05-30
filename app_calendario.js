angular.module('formApp', [])
.controller('FormController', function($scope) {

  $scope.escolas = ['Disciplina A', 'Disciplina B', 'Disciplina C'];
  $scope.turnos = ['Manhã', 'Tarde', 'Noite'];
  $scope.ambientes = [
    { id: 1, nome: 'Laboratório 1' },
    { id: 2, nome: 'Laboratório 2' },
    { id: 3, nome: 'Sala 101' },
    { id: 4, nome: 'Sala 202' },
    { id: 5, nome: 'Auditório' },
  ];

  $scope.semestres = [
    { id: 1, nome: '20251', inicio: new Date('2025-02-19'), fim: new Date('2025-06-30') },
    { id: 2, nome: '20252', inicio: new Date('2025-07-15'), fim: new Date('2025-12-10') },
  ];

  $scope.diasSemana = {
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado'
  };

  $scope.form = {
    diasSelecionados: {},
    aulas: 4
  };

  $scope.intervalo = { start: null, end: null };
  $scope.tabela = [];

  const horarios = {
    'Manhã': {
      1: '08:00 - 10:00',
      2: '10:01 - 12:00',
      4: '08:00 - 12:00',
      desmembrado: ['08:00 - 09:00', '09:01 - 10:00', '10:01 - 11:00', '11:01 - 12:00']
    },
    'Tarde': {
      1: '13:00 - 15:00',
      2: '15:01 - 17:00',
      4: '13:00 - 17:00',
      desmembrado: ['13:00 - 14:00', '14:01 - 15:00', '15:01 - 16:00', '16:01 - 17:00']
    },
    'Noite': {
      1: '18:50 - 20:50',
      2: '20:51 - 22:00',
      4: '18:50 - 22:00',
      desmembrado: ['18:50 - 19:30', '19:31 - 20:10', '20:11 - 20:50', '20:51 - 22:00']
    }
  };

  $scope.evetnoFiltrado = [];

  $scope.definirDatas = function() {
    if ($scope.form.semestre) {
      $scope.intervalo.start = $scope.form.semestre.inicio;
      $scope.intervalo.end = $scope.form.semestre.fim;
    }
  };

  let calendar;

  $scope.atualizarCalendario = function() {
    if (calendar) {
      const eventos = $scope.tabela.map(function(eventoSelecionado) {
        return {
          title: eventoSelecionado.dia + '\n' + eventoSelecionado.horario + '\n' + eventoSelecionado.ambiente.nome,
          start: eventoSelecionado.data,
          allDay: true
        };
      });
      calendar.removeAllEvents();
      calendar.addEventSource(eventos);
    }
  };

  function gerarDataAleatoria(inicio, fim) {
    return new Date(inicio.getTime() + Math.random() * (fim.getTime() - inicio.getTime()));
  }

  function gerarVariasDatasAleatorias(inicio, fim, quantidade) {
    const datas = [];
    for (let i = 0; i < quantidade; i++) {
      datas.push(gerarDataAleatoria(inicio, fim));
    }
    return datas;
  }

  $scope.criarCalendariosSemestre = function() {
    if (!$scope.form.semestre) return;

    const inicio = new Date($scope.form.semestre.inicio);
    const eventos = $scope.tabela.map(function(eventoSelecionado) {
      return {
        title: eventoSelecionado.dia + '\n' + eventoSelecionado.horario + '\n' + eventoSelecionado.ambiente.nome,
        start: eventoSelecionado.data,
        allDay: true
      };
    });

    // Gerar datas aleatórias entre os semestres
    const datasEspecificas = [];

    $scope.semestres.forEach(function(semestre) {
      const datasAleatorias = gerarVariasDatasAleatorias(semestre.inicio, semestre.fim, 20);  // Exemplo: 4 datas por semestre
      datasEspecificas.push(...datasAleatorias);
    });

    for (let i = 0; i < 6; i++) {
      const mes = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
      const calendarEl = document.getElementById('calendarioMes' + (i + 1));
      calendarEl.innerHTML = '';

      const cal = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        initialDate: mes,
        events: eventos,
        locale: 'pt-br',
        showNonCurrentDates: false,

        headerToolbar: {
          left: '',
          center: 'title',
          right: '',
        },
        eventDidMount: function(info) {
          var titleEl = info.el.querySelector('.fc-event-title');
          if (titleEl) {
            titleEl.innerHTML = info.event.title.replace(/\n/g, '<br>');
          }

          var eventDate = new Date(info.event.start);

          var corresponde = datasEspecificas.some(function(data) {
            return eventDate.toDateString() === data.toDateString();
          });

          if (corresponde) {
            info.el.style.backgroundColor = '#ff6e00';
          } else if (eventDate.getMonth() === 2) {
            info.el.style.backgroundColor = '#ff0000';
          }
        },
        eventClick: function(info) {
          $scope.$apply(function() {
            $scope.abrirModal(info.event);
          });
        },
      });

      cal.render();
    }
  };

  //modal

  $scope.modalAberta = false;

  $scope.abrirModal = function(evento) {
    console.log("Abrindo modal com evento:", evento);

    $scope.eventoSelecionado = angular.copy(evento);

    if (!$scope.eventoSelecionado.start) {
      console.warn("Evento sem start definido!", evento);
      $scope.eventoSelecionado.start = new Date();
    }

    if (!($scope.eventoSelecionado.start instanceof Date)) {
      $scope.eventoSelecionado.start = new Date($scope.eventoSelecionado.start);
    }

    $scope.eventoSelecionado.startStr = $scope.eventoSelecionado.start.toISOString().split('T')[0];
    $scope.eventoSelecionado.startHora = $scope.eventoSelecionado.start.toTimeString().slice(0,5);

    //separar o title
    const partes = $scope.eventoSelecionado.title.split('\n');
    $scope.eventoSelecionado.dia = partes[0];
    $scope.eventoSelecionado.horario = partes[1];
    const nomeAmbiente = partes[2];

    // Procurar o ambiente correspondente na lista de ambientes
    const ambienteObj = $scope.ambientes.find(function(a) {
      return a.nome === nomeAmbiente;
    });

    $scope.eventoSelecionado.ambiente = ambienteObj || null; //se nao encontrar

    $scope.eventoFiltrado = [{
      data: $scope.eventoSelecionado.start,
      dia: $scope.eventoSelecionado.dia,
      horario: $scope.eventoSelecionado.horario,
      ambiente: $scope.eventoSelecionado.ambiente,
      desmembrado: false,
      subaulas: []
    }];

    $scope.modalAberta = true;
  };

  $scope.fecharModal = function() {
    $scope.modalAberta = false;
  };

  $scope.salvarEvento = function() {
    // Converte a string de volta para Date
    $scope.eventoSelecionado.start = new Date($scope.eventoSelecionado.startStr);
    $scope.eventoSelecionado.start = new Date($scope.eventoSelecionado.startStr + 'T' + $scope.eventoSelecionado.startHora);

    console.log("Salvando evento:", $scope.eventoSelecionado);

    $scope.fecharModal();
  };

  //modal

  $scope.gerarTabela = function() {
    if (!$scope.intervalo.start || !$scope.intervalo.end) return;

    const diasSelecionados = Object.keys($scope.form.diasSelecionados)
      .filter(k => $scope.form.diasSelecionados[k])
      .map(Number);

    let atual = new Date($scope.intervalo.start);
    const fim = new Date($scope.intervalo.end);
    $scope.tabela = [];

    while (atual <= fim) {
      const diaSemana = atual.getDay();
      const diaAjustado = diaSemana === 0 ? 7 : diaSemana;

      if (diasSelecionados.includes(diaAjustado)) {
        const horario = horarios[$scope.form.turno][$scope.form.aulas];
        $scope.tabela.push({
          data: new Date(atual),
          dia: $scope.diasSemana[diaAjustado],
          ambiente: $scope.form.ambiente,
          horario: horario,
          desmembrado: false,
          subaulas: []
        });
      }
      atual.setDate(atual.getDate() + 1);
    }

    let total = $scope.tabela.length;
    let conflitos = 0;
    $scope.tabela.forEach(eventoSelecionado => {
      if (Math.random() < 0.3) {
        eventoSelecionado.conflito = true;
        conflitos++;
      }
    });

    $scope.muitosConflitos = (conflitos / total > 0.7);
    $scope.conflitos = conflitos;

    $scope.atualizarCalendario();
    $scope.criarCalendariosSemestre();
  };

  $scope.desmembrar = function(eventoSelecionado) {
    var quantidade = $scope.form.aulas;
    let slice = 0;
    let quantidade_slice = 4;

    if (quantidade == 1) {
      slice = 0;
      quantidade_slice = 2;
    } else if (quantidade == 2) {
      slice = 2;
      quantidade_slice = 4;
    }

    const horariosAula = horarios[$scope.form.turno].desmembrado.slice(slice, quantidade_slice);
    eventoSelecionado.desmembrado = true;
    eventoSelecionado.subaulas = horariosAula.map(h => ({
      horario: h,
      ambiente: eventoSelecionado.ambiente
    }));
  };
});
