document.addEventListener('DOMContentLoaded', function () {

    const LUFTDICHTE = 1.204; // kg/m³ bei 20°C

    const defaults = {
        laenge: 120,
        breite: 10,
        durchmesser: 100, // in mm
        geschwindigkeit: 1.1,
        korrekturfaktor: 1.0,
        zeta: 0,
    };

    const inputs = {
        laenge: { slider: document.getElementById('laenge'), num: document.getElementById('laenge-num') },
        breite: { slider: document.getElementById('breite'), num: document.getElementById('breite-num') },
        durchmesser: { slider: document.getElementById('durchmesser'), num: document.getElementById('durchmesser-num') },
        geschwindigkeit: { slider: document.getElementById('geschwindigkeit'), num: document.getElementById('geschwindigkeit-num') },
        zeta: { slider: document.getElementById('zeta'), num: document.getElementById('zeta-num') },
        korrekturfaktor: { slider: document.getElementById('korrekturfaktor'), num: document.getElementById('korrekturfaktor-num') }
    };

    const korrekturProzentVal = document.getElementById('korrektur-prozent-val');
    const ergebnisAnzeige = document.getElementById('ergebnis');
    const druckErgebnisAnzeige = document.getElementById('druck-ergebnis');
    const flaecheErgebnisAnzeige = document.getElementById('flaeche-ergebnis');
    const shapeRadios = document.querySelectorAll('input[name="shape"]');
    const rechteckInputs = document.getElementById('rechteck-inputs');
    const rundInputs = document.getElementById('rund-inputs');
    const resetBtn = document.getElementById('reset-btn');

    function berechnen() {
        const v = parseFloat(inputs.geschwindigkeit.slider.value);
        const k = parseFloat(inputs.korrekturfaktor.slider.value);
        const zeta = parseFloat(inputs.zeta.slider.value);
        const currentShape = document.querySelector('input[name="shape"]:checked').value;
        let flaeche_m2 = 0;

        if (currentShape === 'rechteck') {
            const l_cm = parseFloat(inputs.laenge.slider.value);
            const b_cm = parseFloat(inputs.breite.slider.value);
            flaeche_m2 = (l_cm / 100) * (b_cm / 100);
        } else {
            const d_mm = parseFloat(inputs.durchmesser.slider.value);
            const radius_m = (d_mm / 1000) / 2;
            flaeche_m2 = Math.PI * Math.pow(radius_m, 2);
        }

        const flaeche_cm2 = flaeche_m2 * 10000; // 1 m² = 10.000 cm²
        // HIER IST DIE GEÄNDERTE ZEILE:
        flaecheErgebnisAnzeige.textContent = `Querschnittsfläche: ${flaeche_cm2.toFixed(1)} cm² (${flaeche_m2.toFixed(4)} m²)`;

        const volumenstrom_m3s = flaeche_m2 * v * k;
        const volumenstrom_m3h = volumenstrom_m3s * 3600;
        const druck_pa = zeta * 0.5 * LUFTDICHTE * Math.pow(v, 2);

        ergebnisAnzeige.textContent = `${volumenstrom_m3h.toFixed(1)} m³/h`;
        druckErgebnisAnzeige.textContent = `Differenzdruck: ${druck_pa.toFixed(1)} Pa (bei ζ=${zeta.toFixed(2)})`;
        
        const faktor = parseFloat(inputs.korrekturfaktor.slider.value);
        const prozent = (faktor - 1) * 100;
        korrekturProzentVal.textContent = `(${prozent >= 0 ? '+' : ''}${prozent.toFixed(1)}%)`;
    }

    function validateAndSync(source, target) {
        const min = parseFloat(source.min);
        const max = parseFloat(source.max);
        
        const sanitizedValue = source.value.replace(',', '.');
        let value = parseFloat(sanitizedValue);

        if (isNaN(value)) {
            return; 
        }

        if (value > max) {
            value = max;
            source.value = value;
        } else if (value < min) {
            value = min;
            source.value = value;
        }
        
        target.value = value;
        berechnen();
    }
    
    for (const key in inputs) {
        const pair = inputs[key];
        pair.slider.addEventListener('input', () => validateAndSync(pair.slider, pair.num));
        pair.num.addEventListener('input', () => validateAndSync(pair.num, pair.slider));
        
        pair.num.addEventListener('blur', () => {
            const sanitizedValue = pair.num.value.replace(',', '.');
            const numericValue = parseFloat(sanitizedValue);

            if (isNaN(numericValue)) {
                pair.num.value = pair.slider.value;
            } else {
                pair.num.value = numericValue;
            }
        });
    }

    function toggleShapeView() {
        const currentShape = document.querySelector('input[name="shape"]:checked').value;
        rechteckInputs.style.display = (currentShape === 'rechteck') ? 'block' : 'none';
        rundInputs.style.display = (currentShape === 'rund') ? 'block' : 'none';
        berechnen();
    }

    function resetValues() {
        for (const key in defaults) {
            if (inputs[key]) {
                inputs[key].slider.value = defaults[key];
                inputs[key].num.value = defaults[key];
            }
        }
        document.getElementById('shape-rechteck').checked = true;
        toggleShapeView();
    }

    shapeRadios.forEach(radio => radio.addEventListener('change', toggleShapeView));
    resetBtn.addEventListener('click', resetValues);

    resetValues();
});
