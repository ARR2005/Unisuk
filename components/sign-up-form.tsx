import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { TextInput, View } from 'react-native';
import { signUp as firebaseSignUp } from '../firebaseConfig';

export function SignUpForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const rePasswordInputRef = React.useRef<TextInput>(null);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rePassword, setRePassword] = React.useState('');
  const [errors, setErrors] = React.useState({ email: '', password: '', rePassword: '', form: '' });
  const [loading, setLoading] = React.useState(false);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onPasswordSubmitEditing() {
    rePasswordInputRef.current?.focus();
  }

  function validate() {
    const newErrors = { email: '', password: '', rePassword: '', form: '' };
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== rePassword) {
      newErrors.rePassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.rePassword;
  }

  function onSubmit() {
    if (validate()) {
      setModalVisible(true);
    }
  }

  function handleAccept() {
    setModalVisible(false);
    setLoading(true);
    setErrors({ email: '', password: '', rePassword: '', form: '' });
    (async () => {
      try {
        await firebaseSignUp(email, password);
        router.replace('/(onboarding)');
      } catch (e: any) {
        setErrors((prev) => ({ ...prev, form: e?.message || 'Failed to create account' }));
      } finally {
        setLoading(false);
      }
    })();
  }

  return (
    <>
      <View className="w-full">
        <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
          <CardHeader>
            <CardTitle className="text-center text-xl sm:text-left">Create your account</CardTitle>
            <CardDescription className="text-center sm:text-left">
              Welcome! Please fill in the details to get started.
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
                </View>
                <Input
                  ref={passwordInputRef}
                  id="password"
                  secureTextEntry
                  returnKeyType="next"
                  onSubmitEditing={onPasswordSubmitEditing}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                {errors.password ? <Text className="text-red-500">{errors.password}</Text> : null}
              </View>
              <View className="gap-1.5">
                <View className="flex-row items-center">
                  <Label htmlFor="re-password">Re-enter Password</Label>
                </View>
                <Input
                  ref={rePasswordInputRef}
                  id="re-password"
                  secureTextEntry
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                  value={rePassword}
                  onChangeText={setRePassword}
                  editable={!loading}
                />
                {errors.rePassword ? <Text className="text-red-500">{errors.rePassword}</Text> : null}
              </View>

              <Button className="w-full bg-green-500" onPress={onSubmit} disabled={loading}>
                {loading ? <Text>Creating account...</Text> : <Text> Sign Up</Text>}
              </Button>
            </View>
            <Text className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/(auth)/login" className="text-sm underline underline-offset-4">
                Sign in
              </Link>
            </Text>
            <View className="flex-row items-center"></View>
          </CardContent>
        </Card>
      </View>
      <Dialog open={isModalVisible} onOpenChange={setModalVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please read and accept the terms and conditions before creating an account.
              {'\n\n'}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget
              fermentum aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onPress={() => setModalVisible(false)} disabled={loading}>
              <Text>Decline</Text>
            </Button>
            <Button onPress={handleAccept} disabled={loading}>
              {loading ? <Text>Loading...</Text> : <Text>Accept</Text>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
