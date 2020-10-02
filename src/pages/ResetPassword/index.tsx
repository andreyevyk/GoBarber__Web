import React, { useCallback, useRef } from 'react';
import { FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { useLocation, useHistory } from 'react-router-dom';
import getValidationErrors from '../../utils/getValidationErros';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useToast } from '../../hooks/toast';
import { Container, Content, Background, AnimationContainer } from './styles';

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const location = useLocation();

  const history = useHistory();
  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData): Promise<void> => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          password: Yup.string().min(6, 'Mínimo de 6 digitos'),
          password_confirmation: Yup.string()
            .oneOf([Yup.ref('password')], 'Confirmação incorreta')
            .required('Campo Obrigatório'),
        });
        await schema.validate(data, {
          abortEarly: false,
        });
        const { password, password_confirmation } = data;
        const token = location.search.replace('?token=', '');

        if (!token) {
          throw new Error();
        }

        await api.post('/password/reset', {
          password,
          password_confirmation,
          token,
        });

        history.push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }
        addToast({
          type: 'error',
          title: 'Erro ao resetar sua senha',
          description: 'Ocorreu um erro ao resetar a senha, tente novamente.',
        });
      }
    },
    [addToast, history, location],
  );
  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logo} alt="GoBarber" />
          <Form ref={formRef} initialData={{}} onSubmit={handleSubmit}>
            <h1>Resetar Senha</h1>
            <Input
              name="password"
              icon={FiLock}
              type="password"
              placeholder="Nova Senha"
            />
            <Input
              name="password_confirmation"
              icon={FiLock}
              type="password"
              placeholder="Confirmação da senha"
            />

            <Button type="submit">Alterar Senha</Button>
          </Form>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;
