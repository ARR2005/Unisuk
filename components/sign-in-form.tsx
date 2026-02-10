import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, type TextInput, View } from 'react-native';
import { signIn as firebaseSignIn } from '../firebaseConfig';

export function SignInForm() {
  const router = useRouter();
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({ email: '', password: '', form: '' });
  const [loading, setLoading] = React.useState(false);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function validate() {
    const newErrors = { email: '', password: '', form: '' };
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  }

  function onSubmit() {
    if (validate()) {
      setLoading(true);
      setErrors({ email: '', password: '', form: '' });
      (async () => {
        try {
          await firebaseSignIn(email, password);
          router.replace('/(dashboard)/home');
        } catch (e: any) {
          const mapAuthError = (err: any) => {
            const code = err?.code || '';
            if (code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Incorrect email or password';
            if (code === 'auth/invalid-email') return 'Invalid email address';
            return err?.message || 'Authentication failed';
          };
          setErrors({ email: '', password: '', form: mapAuthError(e) });
        } finally {
          setLoading(false);
        }
      })();
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={60}
      className='w-full'
    >
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to your app</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          {errors.form ? <Text className="text-red-500 text-center">{errors.form}</Text> : null}
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="gmail@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
              {errors.email ? <Text className="text-red-500">{errors.email}</Text> : null}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                  }}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              {errors.password ? <Text className="text-red-500">{errors.password}</Text> : null}
            </View>
            <Button className="w-full bg-green-500 " onPress={onSubmit} disabled={loading}>
              {loading ? <Text>Loading...</Text> : <Text>Continue</Text>}
            </Button>
          </View>
          <Text className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Pressable
              onPress={() => {
              }}>
            </Pressable>
            <Link href="/(auth)/signup" className='text-sm underline underline-offset-4'>Sign up</Link>
          </Text>
        </CardContent>
      </Card>
    </KeyboardAvoidingView>
  );
}
