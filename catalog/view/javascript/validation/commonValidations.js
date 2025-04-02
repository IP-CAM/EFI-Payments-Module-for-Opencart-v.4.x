class CommonValidations {
    static isValidNome(value) {
        return value.trim().length > 0; // Garante que o nome não está vazio
    }

    static isValidTelefone(value) {
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(value);
    }

    static isValidCEP(value) {
        return /^\d{5}-\d{3}$/.test(value);
    }

    static isValidDataNascimento(value) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(value)) return false;

        const [dia, mes, ano] = value.split('/').map(Number);
        const data = new Date(ano, mes - 1, dia);
        return data.getFullYear() === ano && data.getMonth() + 1 === mes && data.getDate() === dia;
    }

    static isValidCartaoCredito(value) {
        value = value.replace(/\D/g, '');
        return CommonValidations.luhnCheck(value);
    }

    static luhnCheck(num) {
        let sum = 0;
        let alternate = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let n = parseInt(num[i], 10);
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 === 0;
    }

    static isValidCPF(value) {
        value = value.replace(/\D/g, '');
        if (value.length !== 11 || /^(\d)\1{10}$/.test(value)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += (10 - i) * parseInt(value[i]);
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(value[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += (11 - i) * parseInt(value[i]);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(value[10]);
    }

    static isValidCNPJ(value) {
        value = value.replace(/\D/g, '');
        if (value.length !== 14 || /^(\d)\1{13}$/.test(value)) return false;

        const calcDigit = (pos) => {
            let soma = 0, peso = pos - 7;
            for (let i = 0; i < pos; i++) {
                soma += parseInt(value[i]) * peso--;
                if (peso < 2) peso = 9;
            }
            let resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        return calcDigit(12) === parseInt(value[12]) && calcDigit(13) === parseInt(value[13]);
    }

    static showErrorMessage(input, message) {
        let errorSpan = input.nextElementSibling;

        if (!errorSpan || !errorSpan.classList.contains('error-message')) {
            errorSpan = document.createElement('span');
            errorSpan.classList.add('error-message', 'text-danger', 'small');
            input.parentNode.appendChild(errorSpan);
        }

        errorSpan.textContent = message;
    }

    static removeErrorMessage(input) {
        let errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.remove();
        }
    }

    static validateField(input) {
        const maskType = input.getAttribute('data-mask');
        let isValid = false;
        let errorMessage = '';

        switch (maskType) {
            case 'nome':
                isValid = CommonValidations.isValidNome(input.value);
                errorMessage = 'O nome não pode estar vazio.';
                break;
            case 'telefone':
                isValid = CommonValidations.isValidTelefone(input.value);
                errorMessage = 'Formato inválido. Use (99) 99999-9999';
                break;
            case 'cep':
                isValid = CommonValidations.isValidCEP(input.value);
                errorMessage = 'Formato inválido. Use 99999-999';
                break;
            case 'data-nascimento':
                isValid = CommonValidations.isValidDataNascimento(input.value);
                errorMessage = 'Data inválida. Use DD/MM/AAAA';
                break;
            case 'cartao':
                isValid = CommonValidations.isValidCartaoCredito(input.value);
                errorMessage = 'Número do cartão inválido.';
                break;
            case 'documento':
                if (input.value.length <= 14) {
                    isValid = CommonValidations.isValidCPF(input.value);
                    errorMessage = 'CPF inválido.';
                } else {
                    isValid = CommonValidations.isValidCNPJ(input.value);
                    errorMessage = 'CNPJ inválido.';
                }
                break;
            default:
                console.warn(`Nenhuma validação definida para: ${maskType}`);
                return;
        }

        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            CommonValidations.removeErrorMessage(input);
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            CommonValidations.showErrorMessage(input, errorMessage);
        }
    }

    static validate() {
        let isValid = true;

        document.querySelectorAll('#efi-pix-form [data-mask]').forEach(input => {
            CommonValidations.validateField(input);
            if (input.classList.contains('is-invalid')) {
                isValid = false;
            }
        });

        return isValid;
    }
    static applyValidation() {
        document.querySelectorAll('[data-mask]').forEach(input => {
            input.addEventListener('blur', () => CommonValidations.validateField(input));
        });
    }
}

