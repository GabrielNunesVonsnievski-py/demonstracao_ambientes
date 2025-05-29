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
    aulas: 4 // valor default
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

  $scope.definirDatas = function() {
    if ($scope.form.semestre) {
      $scope.intervalo.start = $scope.form.semestre.inicio;
      $scope.intervalo.end = $scope.form.semestre.fim;
    }
  };

  $scope.gerarTabela = function() {
    if (!$scope.intervalo.start || !$scope.intervalo.end) return;

    const diasSelecionados = Object.keys($scope.form.diasSelecionados)
      .filter(k => $scope.form.diasSelecionados[k])
      .map(Number);

    let atual = new Date($scope.intervalo.start);
    const fim = new Date($scope.intervalo.end);
    $scope.tabela = [];

    while (atual <= fim) {
      const diaSemana = atual.getDay(); // 0 = domingo
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
    $scope.tabela.forEach(item => {
      const sorteio = Math.random();
      if (sorteio < 0.6) { // 30% de chance
        item.conflito = true;
        conflitos++;
      }
    });

    // Se mais de 70% tiver conflito, marcar todos e ativar alerta
    if (conflitos / total > 0.7) {
      $scope.muitosConflitos = true;
    } else {
      $scope.muitosConflitos = false;
    }

    $scope.conflitos = conflitos;
  };

  $scope.desmembrar = function(item) {
    var quantidade = $scope.form.aulas;

    if (quantidade == 1) {
      slice = 0;
      quantidade_slice = 2;
    } else if (quantidade == 2) {
      slice = 2;
      quantidade_slice = 4;
    } else {
      slice = 0;
      quantidade_slice = 4;
    }

    const horariosAula = horarios[$scope.form.turno].desmembrado.slice(slice, quantidade_slice);
    item.desmembrado = true;
    item.subaulas = horariosAula.map(h => ({
      horario: h,
      ambiente: item.ambiente
    }));
  };
});
