// Configuration Stripe pour les paiements
document.addEventListener('DOMContentLoaded', function() {
    // Configuration Stripe (remplacez par votre clé publique)
    const stripe = Stripe('pk_test_51234567890abcdef...'); // Clé publique Stripe
    
    // Éléments du formulaire
    const donationForm = document.getElementById('donation-form');
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');
    const selectedAmountDisplay = document.getElementById('selected-amount');
    const btnAmount = document.getElementById('btn-amount');
    const donateBtn = document.getElementById('donate-btn');
    
    let selectedAmount = 0;
    
    // Gestion de la sélection du montant
    amountButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            amountButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Mettre à jour le montant sélectionné
            selectedAmount = parseInt(this.dataset.amount);
            updateAmountDisplay();
            
            // Vider le champ montant personnalisé
            customAmountInput.value = '';
        });
    });
    
    // Gestion du montant personnalisé
    customAmountInput.addEventListener('input', function() {
        if (this.value) {
            // Retirer la classe active de tous les boutons
            amountButtons.forEach(btn => btn.classList.remove('active'));
            
            // Mettre à jour le montant sélectionné
            selectedAmount = parseInt(this.value) || 0;
            updateAmountDisplay();
        }
    });
    
    // Fonction pour mettre à jour l'affichage du montant
    function updateAmountDisplay() {
        if (selectedAmount > 0) {
            selectedAmountDisplay.textContent = formatAmount(selectedAmount);
            btnAmount.textContent = formatAmount(selectedAmount);
            donateBtn.disabled = false;
        } else {
            selectedAmountDisplay.textContent = '0 FCFA';
            btnAmount.textContent = '0 FCFA';
            donateBtn.disabled = true;
        }
    }
    
    // Formatage du montant
    function formatAmount(amount) {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    }
    
    // Formatage automatique du numéro de carte
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', function() {
        let value = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue !== this.value) {
            this.value = formattedValue;
        }
        
        // Détection du type de carte
        detectCardType(value);
    });
    
    // Formatage automatique de la date d'expiration
    const cardExpiryInput = document.getElementById('card-expiry');
    cardExpiryInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        this.value = value;
    });
    
    // Formatage automatique du CVC
    const cardCvcInput = document.getElementById('card-cvc');
    cardCvcInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
    });
    
    // Détection du type de carte
    function detectCardType(cardNumber) {
        const cardIcons = document.querySelectorAll('.card-icon');
        cardIcons.forEach(icon => icon.style.opacity = '0.3');
        
        if (cardNumber.startsWith('4')) {
            // Visa
            document.querySelector('.card-icon[alt="Visa"]').style.opacity = '1';
        } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
            // Mastercard
            document.querySelector('.card-icon[alt="Mastercard"]').style.opacity = '1';
        } else if (cardNumber.startsWith('3')) {
            // American Express
            document.querySelector('.card-icon[alt="American Express"]').style.opacity = '1';
        }
    }
    
    // Validation du formulaire
    function validateForm() {
        const requiredFields = [
            { id: 'donor-name', message: 'Le nom est requis' },
            { id: 'donor-email', message: 'L\'email est requis' },
            { id: 'card-number', message: 'Le numéro de carte est requis' },
            { id: 'card-expiry', message: 'La date d\'expiration est requise' },
            { id: 'card-cvc', message: 'Le CVC est requis' },
            { id: 'card-name', message: 'Le nom sur la carte est requis' }
        ];
        
        let isValid = true;
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            const value = element.value.trim();
            
            if (!value) {
                showFieldError(element, field.message);
                isValid = false;
            } else {
                scrollToTop();
                clearFieldError(element);
            }
        });
        
        // Validation spécifique de l'email
        const emailField = document.getElementById('donor-email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Veuillez entrer un email valide');
            isValid = false;
        }
        
        // Validation du montant
        if (selectedAmount < 1000) {
            showNotification('Le montant minimum est de 1 000 FCFA', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Validation de l'email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Affichage des erreurs de champ
    function showFieldError(field, message) {
        field.classList.add('error');
        
        // Supprimer l'ancien message d'erreur
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Ajouter le nouveau message d'erreur
        addClass(existingError, 'field-error');
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
    
    // Suppression des erreurs de champ
    function clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    // Gestion de la soumission du formulaire
    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Afficher l'état de chargement
        showLoadingState();
        
        try {
            // Récupérer les données du formulaire
            const formData = new FormData(donationForm);
            const donationData = {
                amount: selectedAmount,
                donor_name: formData.get('donor-name'),
                donor_email: formData.get('donor-email'),
                donation_type: formData.get('donation-type'),
                frequency: formData.get('frequency'),
                anonymous: formData.get('anonymous') === '1',
                card_number: formData.get('card-number').replace(/\s/g, ''),
                card_expiry: formData.get('card-expiry'),
                card_cvc: formData.get('card-cvc'),
                card_name: formData.get('card-name'),
                save_card: formData.get('save-card') === '1'
            };
            
            // Créer le PaymentIntent côté serveur
            const response = await fetch('php/create-payment-intent.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(donationData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la création du paiement');
            }
            
            // Confirmer le paiement avec Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                result.client_secret,
                {
                    payment_method: {
                        card: {
                            number: donationData.card_number,
                            exp_month: parseInt(donationData.card_expiry.split('/')[0]),
                            exp_year: parseInt('20' + donationData.card_expiry.split('/')[1]),
                            cvc: donationData.card_cvc
                        },
                        billing_details: {
                            name: donationData.card_name,
                            email: donationData.donor_email
                        }
                    }
                }
            );
            
            if (error) {
                throw new Error(error.message);
            }
            
            if (paymentIntent.status === 'succeeded') {
                // Paiement réussi
                showSuccessMessage(donationData);
                
                // Envoyer un email de confirmation
                await sendConfirmationEmail(donationData, paymentIntent.id);
                
            } else {
                throw new Error('Le paiement n\'a pas pu être traité');
            }
            
        } catch (error) {
            console.error('Erreur de paiement:', error);
            showNotification('Erreur de paiement: ' + error.message, 'error');
        } finally {
            hideLoadingState();
        }
    });
    
    // Affichage de l'état de chargement
    function showLoadingState() {
        donateBtn.disabled = true;
        document.querySelector('.btn-text').style.display = 'none';
        document.querySelector('.btn-loading').style.display = 'inline-flex';
    }
    
    // Masquage de l'état de chargement
    function hideLoadingState() {
        donateBtn.disabled = false;
        document.querySelector('.btn-text').style.display = 'inline';
        document.querySelector('.btn-loading').style.display = 'none';
    }
    
    // Message de succès
    function showSuccessMessage(donationData) {
        const modal = document.getElementById('donation-modal');
        const modalContent = modal.querySelector('.modal-content');
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>✅ Don confirmé !</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="success-content">
                    <div class="success-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h4>Merci pour votre générosité !</h4>
                    <p>Votre don de <strong>${formatAmount(selectedAmount)}</strong> a été traité avec succès.</p>
                    
                    <div class="donation-details">
                        <h5>Détails du don :</h5>
                        <ul>
                            <li><strong>Montant :</strong> ${formatAmount(selectedAmount)}</li>
                            <li><strong>Type :</strong> ${getDonationTypeText(donationData.donation_type)}</li>
                            <li><strong>Fréquence :</strong> ${getFrequencyText(donationData.frequency)}</li>
                            <li><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</li>
                        </ul>
                    </div>
                    
                    <div class="next-steps">
                        <h5>Prochaines étapes :</h5>
                        <ul>
                            <li>Vous recevrez un email de confirmation dans quelques minutes</li>
                            <li>Un reçu fiscal vous sera envoyé par email</li>
                            <li>Nous vous tiendrons informé de l'impact de votre don</li>
                        </ul>
                    </div>
                    
                    <div class="success-actions">
                        <button class="btn btn-primary" onclick="window.location.href='index.html'">
                            <i class="fas fa-home"></i>
                            Retour à l'accueil
                        </button>
                        <button class="btn btn-outline" onclick="shareDonation()">
                            <i class="fab fa-share-alt"></i>
                            Partager
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter l'événement de fermeture
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Envoi d'email de confirmation
    async function sendConfirmationEmail(donationData, paymentIntentId) {
        try {
            await fetch('php/send-donation-confirmation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...donationData,
                    payment_intent_id: paymentIntentId
                })
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
        }
    }
    
    // Fonctions utilitaires
    function getDonationTypeText(type) {
        const types = {
            'general': 'Don général',
            'women': 'Autonomisation des femmes',
            'children': 'Protection des enfants',
            'environment': 'Protection environnementale'
        };
        return types[type] || 'Don général';
    }
    
    function getFrequencyText(frequency) {
        return frequency === 'monthly' ? 'Don mensuel' : 'Don unique';
    }
    
    function shareDonation() {
        const text = `Je viens de faire un don à OASIS ÉDUCATION ET DÉVELOPPEMENT pour soutenir l'éducation et le développement durable au Bénin. Rejoignez-moi ! 🌍💚`;
        const url = window.location.origin;
        
        if (navigator.share) {
            navigator.share({
                title: 'Soutenez OASIS ÉDUCATION ET DÉVELOPPEMENT',
                text: text,
                url: url
            });
        } else {
            // Fallback pour les navigateurs qui ne supportent pas l'API Share
            const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank');
        }
    }
    
    // Fonction de notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Initialisation
    updateAmountDisplay();
});

// Styles CSS pour les notifications
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-error {
        border-left: 4px solid #dc3545;
    }
    
    .notification-success {
        border-left: 4px solid #28a745;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 12px;
    }
    
    .notification-content i {
        font-size: 20px;
    }
    
    .notification-error .notification-content i {
        color: #dc3545;
    }
    
    .notification-success .notification-content i {
        color: #28a745;
    }
    
    .field-error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 5px;
    }
    
    .form-control.error {
        border-color: #dc3545;
    }
    
    .success-content {
        text-align: center;
        padding: 20px;
    }
    
    .success-icon {
        font-size: 4rem;
        color: #28a745;
        margin-bottom: 20px;
    }
    
    .donation-details, .next-steps {
        text-align: left;
        margin: 20px 0;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .donation-details ul, .next-steps ul {
        margin: 10px 0 0 20px;
    }
    
    .donation-details li, .next-steps li {
        margin-bottom: 5px;
    }
    
    .success-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
    }
`;

// Ajouter les styles CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
