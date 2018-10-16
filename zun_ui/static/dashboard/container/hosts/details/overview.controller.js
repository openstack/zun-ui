/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('horizon.dashboard.container.hosts')
    .controller('horizon.dashboard.container.hosts.OverviewController', controller);

  controller.$inject = [
    '$scope'
  ];

  function controller(
    $scope
  ) {
    var ctrl = this;
    ctrl.chartSettings = {
      innerRadius: 24,
      outerRadius: 48,
      titleClass: "pie-chart-title-medium",
      showTitle: false,
      showLabel: true,
      showLegend: false,
      tooltipIcon: 'fa-square'
    };
    // Chart data is watched by pie-chart directive.
    // So to refresh chart after retrieving data, update whole of 'data' array.
    ctrl.chartDataMem = {
      maxLimit: 10,
      data: []
    };
    ctrl.chartDataCpu = {
      maxLimit: 10,
      data: []
    };
    ctrl.chartDataDisk = {
      maxLimit: 10,
      data: []
    };
    // container for temporal chart data
    var dataMem = [];
    var dataCpu = [];
    var dataDisk = [];

    $scope.context.loadPromise.then(onGetHost);

    function onGetHost(host) {
      ctrl.host = host.data;

      // set data for memory chart
      dataMem = [
        {label: gettext("Used"), value: host.data.mem_used, colorClass: "exists"},
        {label: gettext("Margin"), value: host.data.mem_total - host.data.mem_used,
          colorClass: "margin"}
      ];
      ctrl.chartDataMem = generateChartData(dataMem, gettext("Memory"));

      // set data for CPU chart
      dataCpu = [
        {label: gettext("Used"), value: host.data.cpu_used, colorClass: "exists"},
        {label: gettext("Margin"), value: host.data.cpus - host.data.cpu_used,
          colorClass: "margin"}
      ];
      ctrl.chartDataCpu = generateChartData(dataCpu, gettext("CPU"));

      // set data for disk chart
      dataDisk = [
        {label: gettext("Used"), value: host.data.disk_used, colorClass: "exists"},
        {label: gettext("Margin"), value: host.data.disk_total - host.data.disk_used,
          colorClass: "margin"}
      ];
      ctrl.chartDataDisk = generateChartData(dataDisk, gettext("Disk"));
    }

    function generateChartData(data, title) {
      var sum = data[0].value;
      var max = data[0].value + data[1].value;
      var percent = Math.round(sum / max * 100);
      var overMax = percent > 100;
      var result = {
        title: title,
        label: percent + '%',
        maxLimit: max,
        overMax: overMax,
        data: data
      };
      return result;
    }
  }
})();
