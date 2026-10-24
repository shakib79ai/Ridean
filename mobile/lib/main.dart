import 'package:flutter/material.dart';
import 'theme/tokens.dart';
import 'screens/sign_in_screen.dart';

void main() {
  runApp(const RideanApp());
}

class RideanApp extends StatelessWidget {
  const RideanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ridean',
      debugShowCheckedModeBanner: false,
      theme: rideanTheme(),
      home: const SignInScreen(),
    );
  }
}
