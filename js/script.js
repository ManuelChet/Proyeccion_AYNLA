document.getElementById('calcular-btn').addEventListener('click', () => {
  const nombreCliente = document.getElementById('nombre-cliente').value;
  const montoPrestamo = parseFloat(document.getElementById('monto-prestamo').value);
  const tasaInteres = parseFloat(document.getElementById('tasa-interes').value) / 100;
  const numeroCuotas = parseInt(document.getElementById('numero-cuotas').value) || 0;
  const fechaEntrega = new Date(document.getElementById('fecha-entrega').value);
  const tasaComision = parseFloat(document.getElementById('tasa-comision').value) / 100 || 0;
  const tasaHonorarios = parseFloat(document.getElementById('tasa-honorarios').value) / 100 || 0;
  const tipoCalculo = document.getElementById('tipo-calculo').value;

  if (!montoPrestamo || !tasaInteres || !numeroCuotas || !fechaEntrega || !tipoCalculo) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
  }

  const comision = tasaComision * montoPrestamo;
  const honorarios = tasaHonorarios * montoPrestamo;
  const liquido = montoPrestamo - comision - honorarios;


  let saldo = montoPrestamo;
  const tasaMensual = tasaInteres / 12;
  let resultadoHTML = 
    `<div class="resumen">
      <p><strong>Nombre del Cliente:</strong> ${nombreCliente}</p>
      <p><strong>Gastos Administrativos:</strong> Q${formatearNumero(comision)}</p>
      <p><strong>Honorarios:</strong> Q${formatearNumero(honorarios)}</p>
      <p><strong>Líquido a Recibir:</strong> Q${formatearNumero(liquido)}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Fecha</th>
          <th>Capital</th>
          <th>Interés</th>
          <th>Total</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let i = 1; i <= numeroCuotas; i++) {
      const fechaActual = new Date(fechaEntrega);
      fechaActual.setMonth(fechaEntrega.getMonth() + i);

      let interes, capital, total;

      if (tipoCalculo === 'saldos') {
          interes = saldo * tasaMensual;
          capital = montoPrestamo / numeroCuotas;
          total = capital + interes;
      } else if (tipoCalculo === 'fija') {
          capital = montoPrestamo / numeroCuotas;
          interes = (montoPrestamo * tasaInteres) / 12;
          total = capital + interes;
      }

      saldo = Math.max(0, saldo - capital);

      resultadoHTML += 
        `<tr>
          <td>${i}</td>
          <td>${fechaActual.toLocaleDateString()}</td>
          <td>Q${formatearNumero(capital)}</td>
          <td>Q${formatearNumero(interes)}</td>
          <td>Q${formatearNumero(total)}</td>
          <td>Q${formatearNumero(saldo)}</td>
        </tr>`;
  }

  resultadoHTML += 
      `</tbody>
    </table>`;

  document.getElementById('resultado').innerHTML = resultadoHTML;
});

document.getElementById('exportar-pdf-btn').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(16);
  pdf.text("Proyección de Pagos", 10, 10);

  const nombreCliente = document.getElementById('nombre-cliente').value;
  const montoPrestamo = parseFloat(document.getElementById('monto-prestamo').value).toFixed(2);
  const tasaInteres = parseFloat(document.getElementById('tasa-interes').value).toFixed(2);
  const numeroCuotas = document.getElementById('numero-cuotas').value;

  pdf.setFontSize(12);
  pdf.text(`Nombre del Cliente: ${nombreCliente}`, 10, 20);
  pdf.text(`Monto del Préstamo: Q${formatearNumero(parseFloat(montoPrestamo))}`, 10, 30);
  pdf.text(`Tasa de Interés Anual: ${tasaInteres}%`, 10, 40);
  pdf.text(`Número de Cuotas: ${numeroCuotas}`, 10, 50);

  const resultadoDiv = document.getElementById('resultado');
  const tabla = resultadoDiv.querySelector('table');

  if (tabla) {
      pdf.text("Tabla de Pagos:", 10, 60);

      const headers = [];
      const data = [];

      tabla.querySelectorAll('thead th').forEach(th => {
          headers.push(th.innerText);
      });

      tabla.querySelectorAll('tbody tr').forEach(tr => {
          const row = [];
          tr.querySelectorAll('td').forEach(td => {
              row.push(td.innerText.replace('Q', '').trim());
          });
          data.push(row);
      });

      pdf.autoTable({
          startY: 70,
          head: [headers],
          body: data,
      });
  }

  pdf.save(`Proyeccion_Pagos_${nombreCliente}.pdf`);
});

// Función para formatear números con el formato de Guatemala
function formatearNumero(numero) {
  return new Intl.NumberFormat('es-GT', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}
