document.addEventListener('DOMContentLoaded', () => {
    const printingOrderForm = document.getElementById('printing-order-form');
    const formSteps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const serviceOptionCards = document.querySelectorAll('.service-option-card');
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    
    // Group containing all conditional fields for step 2
    const serviceDetailsGroup = document.getElementById('service-details-group'); 

    const quantityInput = document.getElementById('quantity');
    const pagesInput = document.getElementById('pages');
    const imagesCountInput = document.getElementById('image_count');
    const imagesPerSheetSelect = document.getElementById('images_per_sheet');

    const pagesGroup = document.getElementById('pages-group');
    const imagesCountGroup = document.getElementById('images-count-group');
    const imagesPerSheetGroup = document.getElementById('images-per-sheet-group');
    const duplexGroup = document.getElementById('duplex-group');
    const referencePriceDisplay = document.getElementById('reference-price');
    const formSubmissionMessage = document.querySelector('.form-submission-message');
    const makeAnotherOrderBtn = document.getElementById('make-another-order-btn');

    let currentStep = 1;
    let savedName = '';
    let savedPhone = '';

    // Prices (defined as constants)
    const PRICES = {
        documentos: {
            simple_cara_per_sheet: 15,
            doble_cara_per_sheet: 25
        },
        imagenes: {
            standard_quality_per_sheet: 30,
        },
        distribution_factors: {
            '1x1': 1,
            '2x1': 2,
            '2x2': 4,
            '3x3': 9
        }
    };

    // Function to show a specific step
    function showStep(stepNum) {
        formSteps.forEach((step) => {
            if (parseInt(step.dataset.step) === stepNum) {
                step.classList.add('current-step');
            } else {
                step.classList.remove('current-step');
            }
        });

        stepDots.forEach((dot) => {
            if (parseInt(dot.dataset.stepTarget) === stepNum) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        if (formSubmissionMessage) {
            formSubmissionMessage.style.display = 'none';
            printingOrderForm.style.display = 'block';
        }

        printingOrderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (stepNum === 2) {
            const selectedRadio = document.querySelector('input[name="service"]:checked');
            if (selectedRadio) {
                serviceDetailsGroup.style.display = 'block';
                updateConditionalFields(); // Solo actualiza visibilidad, no valores
            } else {
                serviceDetailsGroup.style.display = 'none';
                quantityInput.value = 1;
                pagesInput.value = '';
                imagesCountInput.value = '';
                imagesPerSheetSelect.value = '';
                document.querySelector('input[name="duplex_type"][value="simple"]').checked = true;
            }
        } else {
            serviceDetailsGroup.style.display = 'none';
        }
    }

    // Function to validate current step fields
    function validateStep(stepNum) {
        let isValid = true;
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNum}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required]:not([style*="display: none"]), select[required]:not([style*="display: none"]), textarea[required]:not([style*="display: none"])');

        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity(); // Shows browser's built-in validation message
                isValid = false;
            }
        });
        return isValid;
    }

    // Function to update visibility of conditional fields based on service selection
    function updateConditionalFields() {
        const selectedRadio = document.querySelector('input[name="service"]:checked');
        const selectedService = selectedRadio ? selectedRadio.value : '';

        // Show the main service details group
        serviceDetailsGroup.style.display = 'block';
        quantityInput.setAttribute('required', 'required'); 
        // Always reset quantity to 1 when a service is newly selected or service type is changed
        if (quantityInput.value === '' || quantityInput.value === '0') {
            quantityInput.value = 1;
        }

        // Reset all service-specific conditional fields' display and required attributes first
        pagesGroup.style.display = 'none';
        imagesCountGroup.style.display = 'none';
        imagesPerSheetGroup.style.display = 'none';
        duplexGroup.style.display = 'none';

        pagesInput.removeAttribute('required');
        imagesCountInput.removeAttribute('required');
        imagesPerSheetSelect.removeAttribute('required');

        // Based on selected service, show relevant fields and set required
        if (selectedService === 'documentos') {
            pagesGroup.style.display = 'block';
            duplexGroup.style.display = 'block';
            pagesInput.setAttribute('required', 'required');
            // Set default value for pages if it's currently empty or 0
            if (pagesInput.value === '' || pagesInput.value === '0') {
                pagesInput.value = 1;
            }
        } else if (selectedService === 'imagenes') {
            imagesCountGroup.style.display = 'block';
            imagesPerSheetGroup.style.display = 'block';
            imagesCountInput.setAttribute('required', 'required');
            imagesPerSheetSelect.setAttribute('required', 'required');
            // Set default value for image_count if it's currently empty or 0
            if (imagesCountInput.value === '' || imagesCountInput.value === '0') {
                imagesCountInput.value = 1;
            }
        }
        
        // Recalculate price whenever fields change
        calculateReferencePrice();
    }

    // Function to calculate and display the reference price
    function calculateReferencePrice() {
        const selectedServiceRadio = document.querySelector('input[name="service"]:checked');
        const service = selectedServiceRadio ? selectedServiceRadio.value : '';
        const quantityCopies = parseInt(quantityInput.value) || 0;
        let referencePrice = 0;

        if (service === 'documentos') {
            const pages = parseInt(pagesInput.value) || 0;
            const duplexType = document.querySelector('input[name="duplex_type"]:checked')?.value || 'simple';

            let totalCostForPages = 0;

            if (duplexType === 'simple') {
                totalCostForPages = pages * PRICES.documentos.simple_cara_per_sheet;
                
            } else { // duplex
                const fullDuplexSheets = Math.floor(pages / 2);
                const remainingPages = pages % 2;

                totalCostForPages = fullDuplexSheets * PRICES.documentos.doble_cara_per_sheet;
                
                if (remainingPages > 0) {
                    totalCostForPages += remainingPages * PRICES.documentos.simple_cara_per_sheet;
                }
            }
            
            referencePrice = totalCostForPages * quantityCopies;

        } else if (service === 'imagenes') {
            const imageCount = parseInt(imagesCountInput.value) || 0;
            const imagesPerSheetOption = imagesPerSheetSelect.value;
            const imagesPerSheetFactor = PRICES.distribution_factors[imagesPerSheetOption] || 1;

            if (imagesPerSheetFactor > 0) {
                const totalLogicalImages = imageCount * quantityCopies;
                const actualPhysicalSheets = Math.ceil(totalLogicalImages / imagesPerSheetFactor);
                referencePrice = actualPhysicalSheets * PRICES.imagenes.standard_quality_per_sheet;
            } else {
                referencePrice = 0; 
            }
        }
        
        referencePriceDisplay.textContent = `$${referencePrice.toFixed(2)}`;
    }


    // Initialize form: show the first step
    showStep(currentStep);

    // Event Listeners for Next and Previous buttons
    if (printingOrderForm) {
        printingOrderForm.addEventListener('click', (event) => {
            if (event.target.classList.contains('next-step-btn')) {
                if (validateStep(currentStep)) {
                    currentStep++;
                    if (currentStep > formSteps.length) {
                        currentStep = formSteps.length;
                    }
                    showStep(currentStep);
                }
            } else if (event.target.classList.contains('prev-step-btn')) {
                currentStep--;
                if (currentStep < 1) {
                    currentStep = 1;
                }
                showStep(currentStep);
            } else if (event.target.classList.contains('step-dot')) {
                const targetStep = parseInt(event.target.dataset.stepTarget);
                if (targetStep < currentStep) {
                    currentStep = targetStep;
                    showStep(currentStep);
                } else if (validateStep(currentStep)) {
                    currentStep = targetStep;
                    showStep(currentStep);
                } else {
                    alert('Por favor, completa los campos obligatorios del paso actual antes de avanzar.');
                }
            }
        });

        // Form Submission Logic (on final step)
        printingOrderForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Recalcular el precio una última vez
            calculateReferencePrice();

            // Agregar console.log para verificar los valores
            console.log('Valores antes de generar el correo:');
            console.log('Cantidad de copias:', quantityInput.value);
            console.log('Páginas del archivo:', pagesInput.value);
            console.log('Precio de referencia:', referencePriceDisplay.textContent);

            // Save name and phone before *any* reset, for "another order"
            savedName = document.getElementById('name').value;
            savedPhone = document.getElementById('phone').value;

            // CAPTURE ALL VALUES DIRECTLY FROM THE DOM ELEMENTS *BEFORE* HIDING/RESETTING
            const name = savedName;
            const phone = savedPhone;
            const selectedServiceRadio = document.querySelector('input[name="service"]:checked');
            const service = selectedServiceRadio ? selectedServiceRadio.value : '';

            const quantity = quantityInput.value || '1'; // Capture value
            const instructions = document.getElementById('instructions').value; // Capture value
            const finalReferencePrice = referencePriceDisplay.textContent; // Capture displayed price

            let pages = '';
            let duplexType = 'Simple Cara'; 
            let imageCount = '';
            let imagesPerSheet = 'No especificado'; 

            if (service === 'documentos') {
                pages = pagesInput.value || '0'; // Capture value
                const duplexTypeRadio = document.querySelector('input[name="duplex_type"]:checked');
                duplexType = duplexTypeRadio ? (duplexTypeRadio.value === 'simple' ? 'Simple Cara' : 'Doble Cara') : 'Simple Cara';
            } else if (service === 'imagenes') {
                imageCount = imagesCountInput.value || '0'; // Capture value
                imagesPerSheet = imagesPerSheetSelect.value || 'No especificado'; // Capture value
                if (imagesPerSheet === '1x1') imagesPerSheet = '1 imagen por hoja (tamaño completo)';
                else if (imagesPerSheet === '2x1') imagesPerSheet = '2 imágenes por hoja (vertical)';
                else if (imagesPerSheet === '2x2') imagesPerSheet = '4 imágenes por hoja (cuadrícula)';
                else if (imagesPerSheet === '3x3') imagesPerSheet = '9 imágenes por hoja (miniatura)';
            }
            
            let specificDetails = '';
            let subjectService = '';

            if (service === 'documentos') {
                specificDetails = `
            Servicio: Impresión de Documentos
            Cantidad de Copias (sets): ${quantity}
            Páginas de tu archivo: ${pages}
            Impresión: ${duplexType}
            `;
                subjectService = 'Documentos';
            } else if (service === 'imagenes') {
                specificDetails = `
            Servicio: Impresión de Imágenes/Fotos
            Cantidad de Copias (sets): ${quantity}
            Cantidad de Imágenes (archivos individuales): ${imageCount}
            Distribución por hoja: ${imagesPerSheet}
            `;
                subjectService = 'Imágenes/Fotos';
            }

            const emailBody = `
Hola PrintX,

He realizado un pedido de impresión a través de su formulario web. Aquí están los detalles:

--- Información de Contacto ---
Nombre: ${name}
Teléfono: ${phone}

--- Detalles del Pedido ---
${specificDetails}
Precio de Referencia: ${finalReferencePrice}

--- Instrucciones Especiales ---
${instructions || 'Ninguna instrucción especial.'}

---

Por favor, adjunta los archivos necesarios a este correo antes de enviarlo. Te contactaremos por teléfono para confirmar los detalles y el presupuesto final.

Saludos cordiales,
${name}
`.replace(/\n/g, '\r\n');

            const subject = encodeURIComponent(`Nuevo Pedido de Impresión (${subjectService}) - PrintX Web`);
            const encodedBody = encodeURIComponent(emailBody);

            window.location.href = `mailto:info@printx.com?subject=${subject}&body=${encodedBody}`;

            printingOrderForm.style.display = 'none';
            if (formSubmissionMessage) {
                formSubmissionMessage.style.display = 'flex';
            }

            // Reset fields for a fresh start for the next order (except name/phone which are saved)
            quantityInput.value = 1;
            pagesInput.value = '';
            imagesCountInput.value = '';
            imagesPerSheetSelect.value = '';
            document.getElementById('instructions').value = '';
            document.querySelector('input[name="duplex_type"][value="simple"]').checked = true;

            serviceOptionCards.forEach(card => card.classList.remove('selected'));
            serviceRadios.forEach(radio => radio.checked = false);

            serviceDetailsGroup.style.display = 'none';
            referencePriceDisplay.textContent = '$0.00';
            
            quantityInput.removeAttribute('required');
            pagesInput.removeAttribute('required');
            imagesCountInput.removeAttribute('required');
            imagesPerSheetSelect.removeAttribute('required');
        });
    }

    // "Make Another Order" button functionality
    if (makeAnotherOrderBtn) {
        makeAnotherOrderBtn.addEventListener('click', () => {
            currentStep = 2; // Go to Step 2
            showStep(currentStep); // Show Step 2, which also handles initial hiding/reset of service details

            document.getElementById('name').value = savedName; // Restore name
            document.getElementById('phone').value = savedPhone; // Restore phone

            // Ensure service selection is unselected for a fresh start in step 2
            serviceOptionCards.forEach(card => card.classList.remove('selected'));
            serviceRadios.forEach(radio => radio.checked = false);
            // The showStep(currentStep) will handle hiding serviceDetailsGroup initially.
        });
    }

    // Handle visual selection for service cards
    serviceOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            serviceOptionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                // Trigger change event to update conditional fields and price
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    });

    // Listen for changes on relevant inputs to update price
    const relevantInputs = [
        quantityInput,
        pagesInput,
        imagesCountInput,
        imagesPerSheetSelect,
        ...document.querySelectorAll('input[name="duplex_type"]')
    ];

    relevantInputs.forEach(input => {
        input.addEventListener('change', calculateReferencePrice);
        input.addEventListener('input', calculateReferencePrice); // For real-time typing updates
    });

    // Listen for changes on the service radio buttons (visual cards)
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', updateConditionalFields); // This will also call calculateReferencePrice
    });

    // Set initial state on page load
    showStep(currentStep);

    // If a service was already selected (e.g., from browser history/refresh on step 2),
    // ensure its card is active and update the fields.
    const initiallyCheckedRadio = document.querySelector('input[name="service"]:checked');
    if (initiallyCheckedRadio) {
        initiallyCheckedRadio.closest('.service-option-card').classList.add('selected');
        // If currentStep is 2, updateConditionalFields will be called by showStep(2)
        // If currentStep is not 2, it means user reloaded on step 1 or 3, so state will be reset.
    }
});